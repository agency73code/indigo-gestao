import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import type { Patient } from '@/features/programas/consultar-programas/types';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { SearchAndFilters } from '@/features/programas/consulta-sessao/components';
import { ToListaSessoes } from '../components';
import * as services from '@/features/programas/consulta-sessao/services';
import { getPatientById } from '@/features/programas/consultar-programas/services';
import type { Sessao, SessaoFiltersState } from '@/features/programas/consulta-sessao/types';

const DEFAULT_FILTERS: SessaoFiltersState = {
    q: '',
    dateRange: 'all',
    program: 'all',
    therapist: 'all',
    sort: 'date-desc',
};

export default function ConsultarSessaoToPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { setPageTitle, setOnBackClick } = usePageTitle();

    const [filters, setFilters] = useState<SessaoFiltersState>(DEFAULT_FILTERS);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [sessions, setSessions] = useState<Sessao[]>([]);
    const [total, setTotal] = useState(0);
    void total;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);

    const pacienteIdFromQuery = useMemo(() => searchParams.get('pacienteId'), [searchParams]);

    useEffect(() => {
        setPageTitle('Consultar Sessão - TO');
    }, [setPageTitle]);

    // Configurar botão de voltar para ir para o hub de TO
    useEffect(() => {
        setOnBackClick(() => () => {
            navigate('/app/programas/fisioterapia');
        });

        return () => {
            setOnBackClick(undefined);
        };
    }, [setOnBackClick, navigate]);

    const syncFiltersToParams = useCallback(
        (nextFilters: SessaoFiltersState, patientId: string | null) => {
            setIsUpdatingUrl(true);
            const params = new URLSearchParams();
            if (patientId) params.set('pacienteId', patientId);
            if (nextFilters.q) params.set('q', nextFilters.q);
            if (nextFilters.dateRange !== 'all') params.set('dateRange', nextFilters.dateRange);
            if (nextFilters.program !== 'all') params.set('program', nextFilters.program);
            if (nextFilters.therapist !== 'all') params.set('therapist', nextFilters.therapist);
            if (nextFilters.sort !== 'date-desc') params.set('sort', nextFilters.sort);
            setSearchParams(params);
            setTimeout(() => setIsUpdatingUrl(false), 50);
        },
        [setSearchParams],
    );

    const applyFilters = useCallback(
        (updater: (prev: SessaoFiltersState) => SessaoFiltersState) => {
            setFilters((prev) => updater(prev));
        },
        [],
    );

    useEffect(() => {
        if (patient) {
            startTransition(() => {
                syncFiltersToParams(filters, patient.id);
            });
        }
    }, [filters, patient, syncFiltersToParams]);

    useEffect(() => {
        if (isUpdatingUrl) return;
        let cancelled = false;

        const loadPatientFromQuery = async () => {
            if (!pacienteIdFromQuery) {
                if (patient) {
                    setPatient(null);
                    setSessions([]);
                    setError(null);
                    setLoading(false);
                }
                return;
            }

            if (patient && patient.id === pacienteIdFromQuery) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const fetched = await getPatientById(pacienteIdFromQuery);
                if (cancelled) return;

                if (fetched) {
                    setPatient(fetched);
                } else {
                    setError('Cliente não encontrado');
                    setPatient(null);
                    setSessions([]);
                }
            } catch {
                if (!cancelled) {
                    setError('Erro ao carregar cliente');
                    setPatient(null);
                    setSessions([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadPatientFromQuery();

        return () => {
            cancelled = true;
        };
    }, [pacienteIdFromQuery, patient, isUpdatingUrl]);

    useEffect(() => {
        let cancelled = false;

        const loadSessions = async () => {
            if (!patient) {
                setSessions([]);
                setTotal(0);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await services.listSessionsByPatient(patient.id, {
                    q: filters.q,
                    dateRange: filters.dateRange,
                    programId: filters.program === 'all' ? undefined : filters.program,
                    therapistId: filters.therapist === 'all' ? undefined : filters.therapist,
                    sort: filters.sort,
                    page: 1,
                    pageSize: 10,
                });
                if (!cancelled) {
                    setSessions(response.items);
                    setTotal(response.total);
                }
            } catch {
                if (!cancelled) {
                    setError('Erro ao carregar sessoes');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadSessions();

        return () => {
            cancelled = true;
        };
    }, [patient, filters]);

    const programOptions = useMemo(() => {
        if (!patient) return [] as string[];
        const unique = new Set<string>();
        sessions.forEach((sessao) => {
            if (sessao.programa) {
                unique.add(sessao.programa);
            }
        });
        return Array.from(unique).sort((a, b) => a.localeCompare(b));
    }, [patient, sessions]);

    const therapistOptions = useMemo(() => {
        if (!patient) return [] as string[];
        const unique = new Set<string>();
        sessions.forEach((sessao) => {
            if (sessao.terapeutaNome) {
                unique.add(sessao.terapeutaNome);
            }
        });
        return Array.from(unique).sort((a, b) => a.localeCompare(b));
    }, [patient, sessions]);

    useEffect(() => {
        if (!patient) return;
        if (filters.program !== 'all' && !programOptions.includes(filters.program)) {
            applyFilters((prev) => ({ ...prev, program: 'all' }));
        }
    }, [patient, filters.program, programOptions, applyFilters]);

    useEffect(() => {
        if (!patient) return;
        if (filters.therapist !== 'all' && !therapistOptions.includes(filters.therapist)) {
            applyFilters((prev) => ({ ...prev, therapist: 'all' }));
        }
    }, [patient, filters.therapist, therapistOptions, applyFilters]);

    const handleSelectPatient = (selected: Patient) => {
        setPatient(selected);
        setError(null);
        setSessions([]);
        setLoading(true);
        syncFiltersToParams(filters, selected.id);
    };

    const handleClear = () => {
        setPatient(null);
        setSessions([]);
        setError(null);
        setLoading(false);
        const reset = { ...DEFAULT_FILTERS };
        setFilters(reset);
        syncFiltersToParams(reset, null);
    };

    const handleFiltersChange = useCallback(
        (changes: Partial<SessaoFiltersState>) => {
            applyFilters((prev) => ({ ...prev, ...changes }));
        },
        [applyFilters],
    );

    const handleViewDetails = (sessionId: string) => {
        if (!patient) return;
        const selectedSession = sessions.find((item) => item.id === sessionId);
        navigate(`/app/programas/fisioterapia/sessoes/${sessionId}?pacienteId=${patient.id}`, {
            state: selectedSession ? { sessionDate: selectedSession.data } : undefined,
        });
    };

    const handleCreateSession = () => {
        if (!patient) return;
        navigate(`/app/programas/fisioterapia/sessoes/registrar?pacienteId=${patient.id}`);
    };

    return (
        <div className="flex flex-col min-h-full w-full">
            <main className="flex-1 pb-20 sm:pb-4 px-4 pt-4 ">
                <div className="space-y-4 max-w-full">
                    <PatientSelector
                        selected={patient ?? undefined}
                        onSelect={handleSelectPatient}
                        onClear={handleClear}
                        autoOpenIfEmpty={false}
                    />

                    <SearchAndFilters
                        disabled={!patient}
                        q={filters.q}
                        dateRange={filters.dateRange}
                        program={filters.program}
                        therapist={filters.therapist}
                        sort={filters.sort}
                        programOptions={programOptions}
                        therapistOptions={therapistOptions}
                        onChange={handleFiltersChange}
                        renderButton={
                            <Button
                                onClick={handleCreateSession}
                                disabled={!patient}
                                size="icon"
                                className="h-10 w-10 rounded-full shrink-0"
                                title="Adicionar sessão"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        }
                    />

                    {!patient && !loading && (
                        <Card className="rounded-[5px]">
                            <CardContent className="p-6 text-sm text-muted-foreground">
                                Selecione um cliente para ver as sessoes registradas.
                            </CardContent>
                        </Card>
                    )}

                    {loading && (
                        <Card className="rounded-[5px]">
                            <CardContent className="p-6 text-sm">
                                Carregando informacoes...
                            </CardContent>
                        </Card>
                    )}

                    {error && (
                        <Card className="rounded-[5px]">
                            <CardContent className="p-6 text-sm text-red-600">{error}</CardContent>
                        </Card>
                    )}

                    {patient && !loading && !error && (
                        <ToListaSessoes
                            sessoes={sessions}
                            onVerDetalhes={handleViewDetails}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
