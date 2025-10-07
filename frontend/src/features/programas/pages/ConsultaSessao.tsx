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

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const DEFAULT_FILTERS: SessaoFiltersState = {
    q: '',
    dateRange: 'all',
    program: 'all',
    therapist: 'all',
    sort: 'date-desc',
};

function getSessionTime(sessao: Sessao): number {
    const timestamp = new Date(sessao.data).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default function ConsultaSessao() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState<SessaoFiltersState>(DEFAULT_FILTERS);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [sessions, setSessions] = useState<Sessao[]>([]);
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
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const items = await services.listSessionsByPatient(patient.id);
                if (!cancelled) {
                    setSessions(items);
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
    }, [patient]);

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

    const filteredSessions = useMemo(() => {
        if (!patient) return [] as Sessao[];

        const now = Date.now();
        const currentYear = new Date(now).getFullYear();

        const matchesDateRange = (sessao: Sessao) => {
            if (filters.dateRange === 'all') return true;
            const sessionTime = getSessionTime(sessao);
            if (!sessionTime) return false;
            const diff = now - sessionTime;
            switch (filters.dateRange) {
                case 'last7':
                    return diff <= 7 * DAY_IN_MS;
                case 'last30':
                    return diff <= 30 * DAY_IN_MS;
                case 'year':
                    return new Date(sessionTime).getFullYear() === currentYear;
                default:
                    return true;
            }
        };

        const matchesProgram = (sessao: Sessao) =>
            filters.program === 'all' || sessao.programa === filters.program;

        const matchesTherapist = (sessao: Sessao) =>
            filters.therapist === 'all' || sessao.terapeutaNome === filters.therapist;

        const matchesQuery = (sessao: Sessao) => {
            if (!filters.q) return true;
            const query = filters.q.toLowerCase();
            return (
                sessao.programa.toLowerCase().includes(query) ||
                sessao.objetivo.toLowerCase().includes(query) ||
                (sessao.terapeutaNome ?? '').toLowerCase().includes(query)
            );
        };

        const filtered = sessions.filter(
            (sessao) =>
                matchesDateRange(sessao) &&
                matchesProgram(sessao) &&
                matchesTherapist(sessao) &&
                matchesQuery(sessao),
        );

        const getAccuracy = (sessao: Sessao) => services.resumirSessao(sessao).acerto;

        return filtered.sort((a, b) => {
            switch (filters.sort) {
                case 'date-asc':
                    return getSessionTime(a) - getSessionTime(b);
                case 'date-desc':
                    return getSessionTime(b) - getSessionTime(a);
                case 'accuracy-asc':
                    return getAccuracy(a) - getAccuracy(b);
                case 'accuracy-desc':
                    return getAccuracy(b) - getAccuracy(a);
                default:
                    return 0;
            }
        });
    }, [patient, sessions, filters]);

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
            <div className="px-0 sm:px-4 py-4 sm:py-4">
                <HeaderSection
                    title="Consultar Sessão"
                    subtitle="Selecione um cliente para visualizar o historico e os resultados das sessoes."
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
                            sessoes={filteredSessions}
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
