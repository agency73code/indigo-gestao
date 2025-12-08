import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import type { Patient } from '@/features/programas/consultar-programas/types';
import { getPatientById } from '@/features/programas/consultar-programas/services';
import type { ProgramDetail } from '@/features/programas/detalhe-ocp/types';
import type { Sessao } from '@/features/programas/consulta-sessao/types';
import { findSessionById, getSessionById, findProgramSessionById } from '@/features/programas/consulta-sessao/services';
import { initializeMockSessionFiles } from '../../session/services';
import { DetalheSessaoMusi } from '../components';

type LocationState = {
  sessionDate?: string;
};

export default function DetalheSessaoMusiPage() {
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
      setPageTitle(`Sessão - Musicoterapia de ${patient.name}`);
    } else {
      setPageTitle('Detalhes da Sessão - Musicoterapia');
    }
  }, [patient, setPageTitle]);

  useEffect(() => {
    let cancelled = false;
    
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
          sessionData = await getSessionById(pacienteIdFromQuery, sessaoId, 'musicoterapia');
        }

        if (!sessionData) {
          sessionData = await findSessionById(sessaoId, undefined, 'musicoterapia');
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
          try {
            patientData = await getPatientById(patientId);
          } catch (err) {
            // Se falhar ao buscar paciente (ex: 404), usar dados do mock
            console.warn('Usando dados de paciente do mock:', err);
            patientData = null;
          }
        }

        let mockProgramDetail: ProgramDetail | null = await findProgramSessionById(sessaoId, 'musicoterapia');
        
        if (!mockProgramDetail) {
          // Usa o mock específico de musicoterapia
          const { mockMusiProgram } = await import('../../mocks/programMock');
          mockProgramDetail = {
            id: mockMusiProgram.id,
            patientId: mockMusiProgram.patientId,
            patientName: mockMusiProgram.patientName,
            patientGuardian: mockMusiProgram.patient?.guardianName,
            patientAge: mockMusiProgram.patient?.age,
            patientPhotoUrl: mockMusiProgram.patient?.photoUrl ?? null,
            prazoInicio: mockMusiProgram.prazoInicio,
            prazoFim: mockMusiProgram.prazoFim,
            therapistId: mockMusiProgram.therapistId,
            therapistName: mockMusiProgram.therapistName,
            therapistPhotoUrl: mockMusiProgram.therapistPhotoUrl,
            createdAt: mockMusiProgram.createdAt,
            goalTitle: mockMusiProgram.goalTitle,
            goalDescription: mockMusiProgram.goalDescription,
            shortTermGoalDescription: mockMusiProgram.shortTermGoalDescription,
            stimuliApplicationDescription: mockMusiProgram.stimuliApplicationDescription,
            stimuli: mockMusiProgram.stimuli.map(s => ({
              id: s.id,
              order: s.order,
              label: s.label,
              description: s.description,
              metodos: s.metodos,
              tecnicasProcedimentos: s.tecnicasProcedimentos,
              active: s.active,
            })),
            criteria: mockMusiProgram.criteria,
            notes: mockMusiProgram.notes,
            status: mockMusiProgram.status,
          };
        }

        const derivedProgram: ProgramDetail = {
          ...mockProgramDetail,
          patientId: sessionData.pacienteId,
          patientName: patientData?.name ?? mockProgramDetail.patientName,
          patientGuardian: patientData?.guardianName ?? mockProgramDetail.patientGuardian,
          patientAge: patientData?.age ?? mockProgramDetail.patientAge,
          patientPhotoUrl: patientData?.photoUrl ?? mockProgramDetail.patientPhotoUrl,
        };

        console.log('🎵 [DetalheSessaoMusiPage] derivedProgram.stimuli:', derivedProgram.stimuli);

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
      navigate(`/app/programas/musicoterapia/sessoes/consultar?pacienteId=${pacienteIdFromQuery}`);
    } else {
      navigate('/app/programas/musicoterapia/sessoes/consultar');
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
      <DetalheSessaoMusi sessao={session} paciente={patient} programa={program} onBack={handleBack} />
    </div>
  );
}
