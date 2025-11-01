import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import HeaderSection from '@/features/programas/consultar-programas/components/HeaderSection';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import type { Patient } from '@/features/programas/consultar-programas/types';
import { ListaSessoes, SearchAndFilters, CreateSessionFab } from '../consulta-sessao/components';
import * as services from '../consulta-sessao/services';
import { getPatientById } from '../consultar-programas/services';
import type { Sessao, SessaoFiltersState } from '../consulta-sessao/types';

const DEFAULT_FILTERS: SessaoFiltersState = {
    q: '',
    dateRange: 'all',
    program: 'all',
    therapist: 'all',
    sort: 'date-desc',
};

export default function ConsultaSessao() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState<SessaoFiltersState>(DEFAULT_FILTERS);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [sessions, setSessions] = useState<Sessao[]>([]);
    const [total, setTotal] = useState(0); // TODO: Usar quando adicionar componente de paginação
    void total; // Silencia warning - será usado na paginação
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);

    const pacienteIdFromQuery = useMemo(() => searchParams.get('pacienteId'), [searchParams]);

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
                // 🔄 Passa filtros da URL para o service
                const response = await services.listSessionsByPatient(patient.id, {
                    q: filters.q,
                    dateRange: filters.dateRange,
                    programId: filters.program === 'all' ? undefined : filters.program,
                    therapistId: filters.therapist === 'all' ? undefined : filters.therapist,
                    sort: filters.sort,
                    page: 1, // TODO: pegar da URL quando adicionar paginação
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

    // ⚠️ FILTROS REMOVIDOS - Agora feito pelo service com adapter
    // A filtragem/ordenação/paginação é feita no backend (futuro) ou localmente pelo adapter

    const handleViewDetails = (sessionId: string) => {
        if (!patient) return;
        const selectedSession = sessions.find((item) => item.id === sessionId);
        navigate(`/app/programas/sessoes/${sessionId}?pacienteId=${patient.id}`, {
            state: selectedSession ? { sessionDate: selectedSession.data } : undefined,
        });
    };

    const handleCreateSession = () => {
        if (!patient) return;

        // Navegar para página de criação de sessão passando o ID do paciente como query param
        navigate(
            `/app/programas/sessoes/nova?pacienteId=${patient.id}&pacienteName=${encodeURIComponent(patient.name)}`,
        );
    };

    return (
        <div className="flex flex-col min-h-full w-full">
            <div className="px-0 sm:px-4 pt-4 sm:pt-4">
                <HeaderSection
                    title="Consultar Sessão"
                    // subtitle="Selecione um cliente para visualizar o historico e os resultados das sessoes."
                />
            </div>

            <main className="flex-1 px-0 sm:px-4 pb-20 sm:pb-24 w-full">
                <div className="space-y-4 sm:space-y-6 mx-auto w-full">
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
                        <ListaSessoes
                            sessoes={sessions}
                            onVerDetalhes={handleViewDetails}
                        />
                    )}
                </div>
            </main>

            {/* FAB para Adicionar Sessão */}
            <CreateSessionFab
                disabled={!patient}
                onClick={handleCreateSession}
                patientName={patient?.name}
            />
        </div>
    );
}
