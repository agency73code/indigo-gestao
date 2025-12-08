import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import type { Patient } from '@/features/programas/consultar-programas/types';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { SearchAndFilters } from '@/features/programas/consulta-sessao/components';
import { MusiListaSessoes } from '../components';
import * as services from '@/features/programas/consulta-sessao/services';
import { getPatientById } from '@/features/programas/consultar-programas/services';
import type { Sessao, SessaoFiltersState } from '@/features/programas/consulta-sessao/types';
import { useCurrentArea } from '@/contexts/AreaContext';

const DEFAULT_FILTERS: SessaoFiltersState = {
    q: '',
    dateRange: 'all',
    program: 'all',
    therapist: 'all',
    sort: 'date-desc',
};

export default function ConsultarSessaoMusiPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { setPageTitle, setOnBackClick } = usePageTitle();
    const area = useCurrentArea('musicoterapia');

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
        setPageTitle('Consultar Sessão - Musicoterapia');
    }, [setPageTitle]);

    useEffect(() => {
        setOnBackClick(() => () => {
            navigate('/app/programas/musicoterapia');
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
                const response = await services.listSessionsByPatient(
                    patient.id,
                    'musicoterapia',
                    {
                        q: filters.q,
                        dateRange: filters.dateRange,
                        programId: filters.program === 'all' ? undefined : filters.program,
                        therapistId: filters.therapist === 'all' ? undefined : filters.therapist,
                        sort: filters.sort,
                        page: 1,
                        pageSize: 10,
                    }
                );
                if (!cancelled) {
                    setSessions(response.items);
                    setTotal(response.total);
                }
            } catch {
                if (!cancelled) {
                    setError('Erro ao carregar sessões');
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
    }, [patient, filters, area]);

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

    const handlePatientSelect = (p: Patient) => {
        setPatient(p);
        setFilters(DEFAULT_FILTERS);
    };

    const handlePatientClear = () => {
        setPatient(null);
        setSessions([]);
        setFilters(DEFAULT_FILTERS);
        setSearchParams(new URLSearchParams());
    };

    const handleVerDetalhes = (sessaoId: string) => {
        const url = patient
            ? `/app/programas/musicoterapia/sessoes/${sessaoId}?pacienteId=${patient.id}`
            : `/app/programas/musicoterapia/sessoes/${sessaoId}`;
        navigate(url);
    };

    const handleNovaSessao = () => {
        const url = patient
            ? `/app/programas/musicoterapia/sessoes/registrar?pacienteId=${patient.id}`
            : `/app/programas/musicoterapia/sessoes/registrar`;
        navigate(url);
    };

    return (
        <div className="space-y-4 p-2 sm:p-4">
            {/* Seletor de Paciente */}
            <PatientSelector
                selected={patient ?? undefined}
                onSelect={handlePatientSelect}
                onClear={handlePatientClear}
                autoOpenIfEmpty={false}
            />

            {/* Conteúdo quando paciente está selecionado */}
            {patient && (
                <>
                    {/* Filtros com Botão Nova Sessão integrado */}
                    <SearchAndFilters
                        q={filters.q}
                        dateRange={filters.dateRange}
                        program={filters.program}
                        therapist={filters.therapist}
                        sort={filters.sort}
                        onChange={(partial) => applyFilters((prev) => ({ ...prev, ...partial }))}
                        programOptions={programOptions}
                        therapistOptions={therapistOptions}
                        renderButton={
                            <Button onClick={handleNovaSessao} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nova Sessão
                            </Button>
                        }
                    />

                    {/* Lista de Sessões */}
                    {loading ? (
                        <Card className="rounded-[5px]">
                            <CardContent className="p-6 text-center text-sm text-muted-foreground">
                                Carregando sessões...
                            </CardContent>
                        </Card>
                    ) : error ? (
                        <Card className="rounded-[5px]">
                            <CardContent className="p-6 text-center text-sm text-red-600">
                                {error}
                            </CardContent>
                        </Card>
                    ) : (
                        <MusiListaSessoes
                            sessoes={sessions}
                            onVerDetalhes={handleVerDetalhes}
                        />
                    )}
                </>
            )}
        </div>
    );
}
