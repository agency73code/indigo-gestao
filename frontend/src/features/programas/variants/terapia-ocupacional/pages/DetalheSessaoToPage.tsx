// Página de detalhe de sessão TO
// Mostra informações específicas: objetivo, parâmetros clínicos, duração, desempenho, arquivos

import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { Patient } from '@/features/programas/consultar-programas/types';
import { getPatientById } from '@/features/programas/consultar-programas/services';
import { toSessionsService } from '../services/toSessions.service';
import type { ToSessionDetail } from '../types';
import { ToSessionDetailView } from '../components';

export default function DetalheSessaoToPage() {
    const { sessaoId } = useParams<{ sessaoId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const pacienteIdFromQuery = useMemo(() => searchParams.get('pacienteId'), [searchParams]);

    const [session, setSession] = useState<ToSessionDetail | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadSession = async () => {
            if (!sessaoId) {
                setError('Sessão inválida');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const sessionData = await toSessionsService.getById(sessaoId);

                if (!sessionData) {
                    if (!cancelled) {
                        setError('Sessão não encontrada');
                        setSession(null);
                        setPatient(null);
                        setLoading(false);
                    }
                    return;
                }

                const patientId = sessionData.patientId ?? pacienteIdFromQuery ?? '';
                let patientData: Patient | null = null;

                if (patientId) {
                    patientData = await getPatientById(patientId);
                }

                const derivedPatient: Patient = patientData ?? {
                    id: sessionData.patientId,
                    name: sessionData.patientName,
                    guardianName: sessionData.patientGuardianName,
                    age: sessionData.patientAge,
                    photoUrl: sessionData.patientPhotoUrl,
                };

                if (cancelled) return;

                setSession(sessionData);
                setPatient(derivedPatient);
            } catch {
                if (!cancelled) {
                    setError('Erro ao carregar sessão');
                    setSession(null);
                    setPatient(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadSession();

        return () => {
            cancelled = true;
        };
    }, [sessaoId, pacienteIdFromQuery, location.pathname]);

    const handleBack = () => {
        if (pacienteIdFromQuery) {
            navigate(`/app/programas/terapia-ocupacional/sessoes?pacienteId=${pacienteIdFromQuery}`);
        } else {
            navigate('/app/programas/terapia-ocupacional/sessoes');
        }
    };

    if (loading) {
        return (
            <Card className="rounded-[5px] m-2 sm:m-4">
                <CardContent className="p-6 text-sm">Carregando sessão...</CardContent>
            </Card>
        );
    }

    if (error || !session || !patient) {
        return (
            <Card className="rounded-[5px] m-2 sm:m-4">
                <CardContent className="p-6 text-sm text-red-600">
                    {error ?? 'Sessão não encontrada'}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 p-2 sm:p-4">
            <ToSessionDetailView session={session} patient={patient} onBack={handleBack} />
        </div>
    );
}

