// Página de consulta de sessões TO
// Reutiliza componentes do sistema base adaptando para dados específicos de TO

import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import type { Patient } from '@/features/programas/consultar-programas/types';
import { getPatientById } from '@/features/programas/consultar-programas/services';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { CreateSessionFab } from '@/features/programas/consulta-sessao/components';
import { toSessionsService } from '../services/toSessions.service';
import type { ToSessionListItem } from '../types';
import { toConfig } from '../config';
import { ToSessionsList, ToSessionsFilters, type ToSessionsFiltersState } from '../components';

export default function ConsultarSessoesToPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Consultar Sessão - TO');
    }, [setPageTitle]);

    const [patient, setPatient] = useState<Patient | null>(null);
    const [sessions, setSessions] = useState<ToSessionListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado dos filtros
    const [filters, setFilters] = useState<ToSessionsFiltersState>({
        q: searchParams.get('q') || '',
        dateRange: (searchParams.get('dateRange') as ToSessionsFiltersState['dateRange']) || 'all',
        program: searchParams.get('program') || 'all',
        therapist: searchParams.get('therapist') || 'all',
        sort: (searchParams.get('sort') as ToSessionsFiltersState['sort']) || 'date-desc',
    });

    const pacienteIdFromQuery = useMemo(() => searchParams.get('pacienteId'), [searchParams]);

    // Sincroniza paciente selecionado com URL
    const syncPatientToUrl = useCallback(
        (patientId: string | null) => {
            const params = new URLSearchParams(searchParams);
            if (patientId) {
                params.set('pacienteId', patientId);
            } else {
                params.delete('pacienteId');
            }
            setSearchParams(params);
        },
        [searchParams, setSearchParams],
    );

    // Sincroniza filtros com URL
    const syncFiltersToUrl = useCallback(
        (newFilters: ToSessionsFiltersState) => {
            const params = new URLSearchParams(searchParams);
            
            if (newFilters.q) params.set('q', newFilters.q);
            else params.delete('q');
            
            if (newFilters.dateRange !== 'all') params.set('dateRange', newFilters.dateRange);
            else params.delete('dateRange');
            
            if (newFilters.program !== 'all') params.set('program', newFilters.program);
            else params.delete('program');
            
            if (newFilters.therapist !== 'all') params.set('therapist', newFilters.therapist);
            else params.delete('therapist');
            
            if (newFilters.sort !== 'date-desc') params.set('sort', newFilters.sort);
            else params.delete('sort');
            
            setSearchParams(params);
        },
        [searchParams, setSearchParams],
    );

    // Handler para mudança de filtros
    const handleFiltersChange = (changes: Partial<ToSessionsFiltersState>) => {
        const newFilters = { ...filters, ...changes };
        setFilters(newFilters);
        syncFiltersToUrl(newFilters);
    };

    // Carrega paciente da URL
    useEffect(() => {
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
    }, [pacienteIdFromQuery, patient]);

    // Carrega sessões do paciente
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
                const items = await toSessionsService.listByPatient(patient.id);
                if (!cancelled) {
                    setSessions(items);
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
    }, [patient]);

    // Filtrar e ordenar sessões
    const filteredSessions = useMemo(() => {
        let result = [...sessions];

        // Filtro por busca de texto
        if (filters.q) {
            const searchTerm = filters.q.toLowerCase();
            result = result.filter(
                (session) =>
                    session.programName.toLowerCase().includes(searchTerm) ||
                    session.goalTitle.toLowerCase().includes(searchTerm) ||
                    session.therapistName.toLowerCase().includes(searchTerm)
            );
        }

        // Filtro por período
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const cutoffDate = new Date();

            if (filters.dateRange === 'last7') {
                cutoffDate.setDate(now.getDate() - 7);
            } else if (filters.dateRange === 'last30') {
                cutoffDate.setDate(now.getDate() - 30);
            } else if (filters.dateRange === 'year') {
                cutoffDate.setMonth(0, 1); // 1º de janeiro do ano atual
            }

            result = result.filter((session) => new Date(session.date) >= cutoffDate);
        }

        // Filtro por programa
        if (filters.program !== 'all') {
            result = result.filter((session) => session.programName === filters.program);
        }

        // Filtro por terapeuta
        if (filters.therapist !== 'all') {
            result = result.filter((session) => session.therapistName === filters.therapist);
        }

        // Ordenação
        if (filters.sort === 'date-desc') {
            result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (filters.sort === 'date-asc') {
            result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else if (filters.sort === 'program-asc') {
            result.sort((a, b) => a.programName.localeCompare(b.programName));
        }

        return result;
    }, [sessions, filters]);

    // Extrair opções únicas para os filtros
    const programOptions = useMemo(() => {
        const unique = [...new Set(sessions.map((s) => s.programName))];
        return unique.sort();
    }, [sessions]);

    const therapistOptions = useMemo(() => {
        const unique = [...new Set(sessions.map((s) => s.therapistName))];
        return unique.sort();
    }, [sessions]);

    const handleSelectPatient = (selectedPatient: Patient) => {
        startTransition(() => {
            setPatient(selectedPatient);
            syncPatientToUrl(selectedPatient.id);
        });
    };

    const handleClearPatient = () => {
        startTransition(() => {
            setPatient(null);
            setSessions([]);
            syncPatientToUrl(null);
        });
    };

    const handleViewDetails = (sessionId: string) => {
        if (!patient) return;
        navigate(`/app/programas/terapia-ocupacional/sessoes/${sessionId}?pacienteId=${patient.id}`);
    };

    const handleCreateSession = () => {
        if (!patient) return;
        navigate(toConfig.routes.registerSession);
    };

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4">
            <main className="space-y-4 flex-1 pb-20 sm:pb-24 pt-4">
                {/* Seletor de cliente */}
                <PatientSelector
                    selected={patient}
                    onSelect={handleSelectPatient}
                    onClear={handleClearPatient}
                />

                {/* Filtros - Aparece quando há paciente selecionado */}
                {patient && !loading && !error && (
                    <ToSessionsFilters
                        q={filters.q}
                        dateRange={filters.dateRange}
                        program={filters.program}
                        therapist={filters.therapist}
                        sort={filters.sort}
                        programOptions={programOptions}
                        therapistOptions={therapistOptions}
                        onChange={handleFiltersChange}
                        disabled={loading}
                    />
                )}

                {/* Lista de sessões */}
                {patient && !loading && !error && (
                    <ToSessionsList
                        sessions={filteredSessions}
                        onViewDetails={handleViewDetails}
                        emptyMessage="Nenhuma sessão encontrada"
                    />
                )}

                {/* Loading */}
                {loading && (
                    <Card className="rounded-[5px]">
                        <CardContent className="p-6 text-sm">Carregando sessões...</CardContent>
                    </Card>
                )}

                {/* Erro */}
                {error && (
                    <Card className="rounded-[5px]">
                        <CardContent className="p-6 text-sm text-red-600">{error}</CardContent>
                    </Card>
                )}

                {/* Empty state */}
                {!patient && !loading && (
                    <Card className="rounded-[5px]">
                        <CardContent className="p-6 text-sm text-muted-foreground">
                            Selecione um cliente para ver as sessões registradas.
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* FAB para adicionar sessão */}
            <CreateSessionFab
                disabled={!patient}
                onClick={handleCreateSession}
                patientName={patient?.name}
            />
        </div>
    );
}

