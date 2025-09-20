import type { Sessao, ResumoSessao } from './types';

// Toggle local mocks (follow existing pattern)
const USE_LOCAL_MOCKS = true;

export async function listSessionsByPatient(patientId: string): Promise<Sessao[]> {
  if (USE_LOCAL_MOCKS) {
    const { mockRecentSessions } = await import(
      '@/features/programas/detalhe-ocp/mocks/sessions.mock'
    );
    const { mockProgramDetail } = await import(
      '@/features/programas/detalhe-ocp/mocks/program.mock'
    );

    // If patient doesn't match mock program, still return empty
    if (mockProgramDetail.patientId !== patientId) {
      // For demo: allow listing even if patient differs by returning same data bound to requested patient
      // but keep the rule of not creating new mocks by reusing available ones.
    }

    // Distribute attempts across stimuli for each session using preview
    const stimuli = mockProgramDetail.stimuli;
    const prazoInicio = mockProgramDetail.createdAt;
    const prazoFim = new Date(new Date(prazoInicio).getTime() + 90 * 24 * 60 * 60 * 1000)
      .toISOString();

    const sessions: Sessao[] = mockRecentSessions.map((s) => {
      const registros = (s.preview ?? []).map((p, idx) => {
        const stim = stimuli[idx % Math.max(1, stimuli.length)];
        const resultado: 'acerto' | 'erro' | 'ajuda' =
          p === 'independent' ? 'acerto' : p === 'error' ? 'erro' : 'ajuda';
        return {
          tentativa: idx + 1,
          resultado,
          stimulusId: stim?.id,
          stimulusLabel: stim?.label,
        };
      });

      return {
        id: s.id,
        pacienteId: patientId,
        terapeutaId: mockProgramDetail.therapistId,
        terapeutaNome: s.therapistName || mockProgramDetail.therapistName,
        data: s.date,
        programa: mockProgramDetail.name || 'Programa',
        objetivo: mockProgramDetail.goalTitle,
        prazoInicio,
        prazoFim,
        registros,
      };
    });

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 200));
    return sessions;
  }

  // TODO: Integrate real API when available
  return [];
}

export async function getSessionById(patientId: string, sessionId: string): Promise<Sessao | null> {
  const list = await listSessionsByPatient(patientId);
  return list.find((s) => s.id === sessionId) ?? null;
}

export async function findSessionById(sessionId: string): Promise<Sessao | null> {
  if (USE_LOCAL_MOCKS) {
    const { mockProgramDetail } = await import(
      '@/features/programas/detalhe-ocp/mocks/program.mock'
    );
    const sessions = await listSessionsByPatient(mockProgramDetail.patientId);
    return sessions.find((s) => s.id === sessionId) ?? null;
  }

  // TODO: Integrate real API when available
  return null;
}

export function resumirSessao(sessao: Sessao): ResumoSessao {
  const total = sessao.registros.length;
  const acertos = sessao.registros.filter((r) => r.resultado === 'acerto').length;
  const independentes = acertos; // acerto representa independência neste contexto
  return {
    acerto: total > 0 ? Math.round((acertos / total) * 100) : 0,
    independencia: total > 0 ? Math.round((independentes / total) * 100) : 0,
    tentativas: total,
  };
}
