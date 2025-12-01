import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import type { Patient } from '@/features/programas/consultar-programas/types';
import { getPatientById } from '@/features/programas/consultar-programas/services';
import type { ProgramDetail } from '@/features/programas/detalhe-ocp/types';
import DetalheSessaoTo from '../components/DetalheSessaoTo';
import type { Sessao } from '@/features/programas/consulta-sessao/types';
import { findSessionById, getSessionById, findProgramSessionById } from '@/features/programas/consulta-sessao/services';
import { initializeMockSessionFiles } from '@/features/programas/variants/terapia-ocupacional/session/services';

type LocationState = {
  sessionDate?: string;
};

export default function DetalheSessaoToPage() {
  const { sessaoId } = useParams<{ sessaoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const { setPageTitle } = usePageTitle();

  const pacienteIdFromQuery = useMemo(() => searchParams.get('pacienteId'), [searchParams]);

  const [session, setSession] = useState<Sessao | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      setPageTitle(`Sessão - TO de ${patient.name}`);
    } else {
      setPageTitle('Detalhes da Sessão - TO');
    }
  }, [patient, setPageTitle]);

  useEffect(() => {
    let cancelled = false;
    
    // Inicializar arquivos mock (apenas para desenvolvimento)
    initializeMockSessionFiles();
    
    const loadSession = async () => {
      if (!sessaoId) {
        setError('Sessão inválida');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let sessionData: Sessao | null = null;

        if (pacienteIdFromQuery) {
          sessionData = await getSessionById(pacienteIdFromQuery, sessaoId, 'terapia-ocupacional');
        }

        if (!sessionData) {
          sessionData = await findSessionById(sessaoId, undefined, 'terapia-ocupacional');
        }

        if (!sessionData) {
          if (!cancelled) {
            setError('Sessão não encontrada');
            setSession(null);
            setPatient(null);
            setProgram(null);
            setLoading(false);
          }
          return;
        }

        const patientId = sessionData.pacienteId ?? pacienteIdFromQuery ?? '';
        let patientData: Patient | null = null;
        if (patientId) {
          patientData = await getPatientById(patientId);
        }

        const mockProgramDetail: ProgramDetail = 
        (await findProgramSessionById(sessaoId)) ??
        (await import('@/features/programas/detalhe-ocp/mocks/program.mock')).mockProgramDetail;

        const derivedProgram: ProgramDetail = {
          ...mockProgramDetail,
          patientId: sessionData.pacienteId,
          patientName: patientData?.name ?? mockProgramDetail.patientName,
          patientGuardian: patientData?.guardianName ?? mockProgramDetail.patientGuardian,
          patientAge: patientData?.age ?? mockProgramDetail.patientAge,
          patientPhotoUrl: patientData?.photoUrl ?? mockProgramDetail.patientPhotoUrl,
        };

        const derivedPatient: Patient = patientData ?? {
          id: sessionData.pacienteId,
          name: derivedProgram.patientName,
          guardianName: derivedProgram.patientGuardian ?? undefined,
          age: derivedProgram.patientAge ?? undefined,
          photoUrl: derivedProgram.patientPhotoUrl ?? undefined,
        };

        if (cancelled) {
          return;
        }

        setSession(sessionData);
        setPatient(derivedPatient);
        setProgram(derivedProgram);

        if (!locationState?.sessionDate) {
          navigate('.', {
            replace: true,
            state: { sessionDate: sessionData.data },
          });
        }
      } catch {
        if (!cancelled) {
          setError('Erro ao carregar sessão');
          setSession(null);
          setPatient(null);
          setProgram(null);
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
  }, [sessaoId, pacienteIdFromQuery, navigate, locationState?.sessionDate]);

  const handleBack = () => {
    if (pacienteIdFromQuery) {
      navigate(`/app/programas/terapia-ocupacional/sessoes/consultar?pacienteId=${pacienteIdFromQuery}`);
    } else {
      navigate('/app/programas/terapia-ocupacional/sessoes/consultar');
    }
  };

  if (loading) {
    return (
      <Card className="rounded-[5px] m-2 sm:m-4">
        <CardContent className="p-6 text-sm">Carregando sessão...</CardContent>
      </Card>
    );
  }

  if (error || !session || !patient || !program) {
    return (
      <Card className="rounded-[5px] m-2 sm:m-4">
        <CardContent className="p-6 text-sm text-red-600">{error ?? 'Sessão não encontrada'}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-4">
      <DetalheSessaoTo sessao={session} paciente={patient} programa={program} onBack={handleBack} />
    </div>
  );
}
