// Página de consulta de sessões TO
// Reutiliza componentes do sistema base adaptando para dados específicos de TO

import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import HeaderSection from '@/features/programas/consultar-programas/components/HeaderSection';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import type { Patient } from '@/features/programas/consultar-programas/types';
import { getPatientById } from '@/features/programas/consultar-programas/services';
import { CreateSessionFab } from '@/features/programas/consulta-sessao/components';
import { toSessionsService } from '../services/toSessions.service';
import type { ToSessionListItem } from '../types';
import { toConfig } from '../config';
import { ToSessionsList } from '../components';

export default function ConsultarSessoesToPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [patient, setPatient] = useState<Patient | null>(null);
    const [sessions, setSessions] = useState<ToSessionListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pacienteIdFromQuery = useMemo(() => searchParams.get('pacienteId'), [searchParams]);

    // Sincroniza paciente selecionado com URL
    const syncPatientToUrl = useCallback(
        (patientId: string | null) => {
            const params = new URLSearchParams();
            if (patientId) params.set('pacienteId', patientId);
            setSearchParams(params);
        },
        [setSearchParams],
    );

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
            <HeaderSection
                title="Consultar Sessão de Terapia Ocupacional"
            />

            <main className="space-y-4 flex-1">
                {/* Seletor de cliente */}
                <PatientSelector
                    selected={patient}
                    onSelect={handleSelectPatient}
                    onClear={handleClearPatient}
                />

                {/* Lista de sessões */}
                {patient && !loading && !error && (
                    <ToSessionsList
                        sessions={sessions}
                        onViewDetails={handleViewDetails}
                        emptyMessage="Nenhuma sessão registrada para este cliente"
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

