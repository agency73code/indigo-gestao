import { buildApiUrl } from '@/lib/api';
import type { Sessao, ResumoSessao, ProgramDetail } from './types';
import type { AreaType } from '@/contexts/AreaContext';

// Mock habilitado apenas para musicoterapia e fisioterapia
// TO usa dados reais da API
const AREAS_WITH_MOCK: AreaType[] = ['musicoterapia', 'fisioterapia'];
const shouldUseMock = (area?: string) => AREAS_WITH_MOCK.includes(area as AreaType);

/**
 * Parâmetros de filtragem para listagem de sessões
 */
export interface SessionListFilters {
  /** Termo de busca */
  q?: string;
  /** Período: 'all' | 'last7' | 'last30' | 'year' */
  dateRange?: string;
  /** Área do programa (fonoaudiologia, terapia-ocupacional, etc.) */
  area?: AreaType;
  /** ID do programa */
  programId?: string;
  /** ID do terapeuta */
  therapistId?: string;
  /** Ordenação */
  sort?: string;
  /** Número da página (1-indexed) */
  page?: number;
  /** Itens por página */
  pageSize?: number;
}

/**
 * Resposta da API com dados paginados
 */
export interface SessionListResponse {
  /** Lista de sessões da página atual */
  items: Sessao[];
  /** Total de registros (após filtros) */
  total: number;
  /** Página atual */
  page: number;
  /** Itens por página */
  pageSize: number;
  /** Total de páginas */
  totalPages: number;
}

/**
 * Lista sessões de um paciente com filtros, ordenação e paginação
 * 
 * 🔄 ADAPTER: Funciona com backend atual (array) e futuro (objeto paginado)
 * @param area - Área da terapia para filtrar sessões (obrigatório)
 */
export async function listSessionsByPatient(
  patientId: string,
  area: string,
  filters: SessionListFilters = {}
): Promise<SessionListResponse> {
  const {
    q = '',
    dateRange = 'all',
    programId = '',
    therapistId = '',
    sort = 'date-desc',
    page = 1,
    pageSize = 10
  } = filters;

  // Usar mocks apenas para musicoterapia e fisioterapia
  if (shouldUseMock(area)) {
    console.warn(`🔄 Usando mock local para ${area}`);
    const mockData = await getMockSessionsData(patientId, area);
    return processSessionsLocally(mockData, filters);
  }

  try {
    // // Construir URL com query params
    // // const url = new URL(`/api/ocp/clients/${patientId}/sessions`, window.location.origin);
    // // Adiciona área (obrigatório)
    // url.searchParams.set('area', area);
    // // Adiciona filtros se houver
    // if (q) url.searchParams.set('q', q);
    // if (dateRange && dateRange !== 'all') url.searchParams.set('dateRange', dateRange);
    // if (programId) url.searchParams.set('programId', programId);
    // if (therapistId) url.searchParams.set('therapistId', therapistId);
    // if (sort) url.searchParams.set('sort', sort);

    const url = buildApiUrl(`/api/ocp/clients/${patientId}/sessions`, {
      area,
      q,
      dateRange,
      programId,
      therapistId,
      sort,
    });

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error(`Erro ao carregar sessões: ${res.status}`);
    
    const response = await res.json();

    // Extrair array do campo 'data' se existir
    const data = response?.data ?? response;

    return {
      items: data,
      total: data.length,
      page,
      pageSize,
      totalPages: 0,
    };

  } catch (error) {
    if (shouldUseMock(area)) {
      console.warn(`🔄 Usando mock local para ${area} (erro na API)`);
      // Mock usa estrutura diferente - convertemos para Sessao[]
      const mockData = await getMockSessionsData(patientId, area);
      return processSessionsLocally(mockData, filters);
    }
    throw error;
  }
}

/**
 * ⚠️ FUNÇÃO AUXILIAR: Converte mocks para formato Sessao[]
 */
async function getMockSessionsData(patientId: string, area?: string): Promise<Sessao[]> {
  
  // 🎯 Se for Fisioterapia, retornar sessões FISIO mocadas
  if (area === 'fisioterapia') {
    const { mockToSessions } = await import(
      '@/features/programas/variants/fisioterapia/mocks/mockSessions'
    );
    const { mockToProgram } = await import(
      '@/features/programas/variants/fisioterapia/mocks/programMock'
    );

    const result = mockToSessions.map((s) => {
      // Gerar registros baseados no activitiesSummary ao invés do preview
      const registros: Array<{
        tentativa: number;
        resultado: 'acerto' | 'erro' | 'ajuda';
        stimulusId?: string;
        stimulusLabel?: string;
        durationMinutes?: number | null;
        usedLoad?: boolean;
        loadValue?: string;
        hadDiscomfort?: boolean;
        discomfortDescription?: string;
        hadCompensation?: boolean;
        compensationDescription?: string;
      }> = [];

      let tentativaCounter = 1;

      if (s.activitiesSummary && s.activitiesSummary.length > 0) {
        // Para cada atividade, criar tentativas baseadas nas contagens
        s.activitiesSummary.forEach((activity) => {
          // Adicionar tentativas de erro (não desempenhou)
          for (let i = 0; i < activity.counts.naoDesempenhou; i++) {
            registros.push({
              tentativa: tentativaCounter++,
              resultado: 'erro',
              stimulusId: activity.activityId,
              stimulusLabel: activity.activityName,
              durationMinutes: activity.durationMinutes,
              usedLoad: activity.usedLoad,
              loadValue: activity.loadValue,
              hadDiscomfort: activity.hadDiscomfort,
              discomfortDescription: activity.discomfortDescription,
              hadCompensation: activity.hadCompensation,
              compensationDescription: activity.compensationDescription,
            });
          }

          // Adicionar tentativas de ajuda (desempenhou com ajuda)
          for (let i = 0; i < activity.counts.desempenhouComAjuda; i++) {
            registros.push({
              tentativa: tentativaCounter++,
              resultado: 'ajuda',
              stimulusId: activity.activityId,
              stimulusLabel: activity.activityName,
              durationMinutes: activity.durationMinutes,
              usedLoad: activity.usedLoad,
              loadValue: activity.loadValue,
              hadDiscomfort: activity.hadDiscomfort,
              discomfortDescription: activity.discomfortDescription,
              hadCompensation: activity.hadCompensation,
              compensationDescription: activity.compensationDescription,
            });
          }

          // Adicionar tentativas de acerto (desempenhou)
          for (let i = 0; i < activity.counts.desempenhou; i++) {
            registros.push({
              tentativa: tentativaCounter++,
              resultado: 'acerto',
              stimulusId: activity.activityId,
              stimulusLabel: activity.activityName,
              durationMinutes: activity.durationMinutes,
              usedLoad: activity.usedLoad,
              loadValue: activity.loadValue,
              hadDiscomfort: activity.hadDiscomfort,
              discomfortDescription: activity.discomfortDescription,
              hadCompensation: activity.hadCompensation,
              compensationDescription: activity.compensationDescription,
            });
          }
        });
      }

      return {
        id: s.id,
        pacienteId: patientId,
        terapeutaId: 'therapist-001',
        terapeutaNome: s.therapistName || 'João Batista',
        data: s.date,
        programa: mockToProgram?.name || 'Programa de Fisioterapia',
        objetivo: mockToProgram?.goalDescription || 'Desenvolver força e amplitude de movimento',
        prazoInicio: '',
        prazoFim: '',
        observacoes: s.observacoes ?? undefined,
        registros,
        area: 'fisioterapia',
      };
    });

    return result;
  }

  // 🎯 Se for o Alessandro (TO), retornar sessões TO mocadas
  if (patientId === 'b6f174c5-87bc-4946-9bff-2eaf72d977b9') {
    const { mockToSessions } = await import(
      '@/features/programas/variants/terapia-ocupacional/mocks/mockSessions'
    );
    const { mockToProgram } = await import(
      '@/features/programas/variants/terapia-ocupacional/mocks/programMock'
    );

    const result = mockToSessions.map((s) => {
      // Gerar registros baseados no activitiesSummary ao invés do preview
      const registros: Array<{
        tentativa: number;
        resultado: 'acerto' | 'erro' | 'ajuda';
        stimulusId?: string;
        stimulusLabel?: string;
        durationMinutes?: number | null;
      }> = [];

      let tentativaCounter = 1;

      if (s.activitiesSummary && s.activitiesSummary.length > 0) {
        // Para cada atividade, criar tentativas baseadas nas contagens
        s.activitiesSummary.forEach((activity) => {
          // Adicionar tentativas de erro (não desempenhou)
          for (let i = 0; i < activity.counts.naoDesempenhou; i++) {
            registros.push({
              tentativa: tentativaCounter++,
              resultado: 'erro',
              stimulusId: activity.activityId,
              stimulusLabel: activity.activityName,
              durationMinutes: activity.durationMinutes,
            });
          }

          // Adicionar tentativas de ajuda (desempenhou com ajuda)
          for (let i = 0; i < activity.counts.desempenhouComAjuda; i++) {
            registros.push({
              tentativa: tentativaCounter++,
              resultado: 'ajuda',
              stimulusId: activity.activityId,
              stimulusLabel: activity.activityName,
              durationMinutes: activity.durationMinutes,
            });
          }

          // Adicionar tentativas de acerto (desempenhou)
          for (let i = 0; i < activity.counts.desempenhou; i++) {
            registros.push({
              tentativa: tentativaCounter++,
              resultado: 'acerto',
              stimulusId: activity.activityId,
              stimulusLabel: activity.activityName,
              durationMinutes: activity.durationMinutes,
            });
          }
        });
      }

      return {
        id: s.id,
        pacienteId: patientId,
        terapeutaId: 'therapist-001',
        terapeutaNome: s.therapistName || 'João Batista',
        data: s.date,
        programa: 'Programa de Desenvolvimento de AVDs',
        objetivo: mockToProgram.goalDescription || 'Desenvolver independência nas atividades de vida diária',
        prazoInicio: '',
        prazoFim: '',
        observacoes: s.observacoes ?? undefined,
        registros,
        area: 'terapia-ocupacional',
      };
    });

    return result;
  }

  // 🎵 Se for Musicoterapia, retornar sessões MUSI mocadas
  if (area === 'musicoterapia') {
    const { mockMusiSessions } = await import(
      '@/features/programas/variants/musicoterapia/mocks/mockSessions'
    );
    const { mockMusiProgram } = await import(
      '@/features/programas/variants/musicoterapia/mocks/programMock'
    );

    const result = mockMusiSessions.map((s) => {
      // Gerar registros baseados no activitiesSummary com participação e suporte
      const registros: Array<{
        tentativa: number;
        resultado: 'acerto' | 'erro' | 'ajuda';
        stimulusId?: string;
        stimulusLabel?: string;
        durationMinutes?: number | null;
        participacao?: number | null;
        suporte?: number | null;
      }> = [];

      let tentativaCounter = 1;

      if (s.activitiesSummary && s.activitiesSummary.length > 0) {
        // Para cada atividade, criar tentativas baseadas nas contagens
        s.activitiesSummary.forEach((activity) => {
          const activityWithScales = activity as typeof activity & { participacao?: number; suporte?: number };
          
          // Adicionar tentativas de erro (não desempenhou)
          for (let i = 0; i < activity.counts.naoDesempenhou; i++) {
            registros.push({
              tentativa: tentativaCounter++,
              resultado: 'erro',
              stimulusId: activity.activityId,
              stimulusLabel: activity.activityName,
              durationMinutes: activity.durationMinutes,
              participacao: activityWithScales.participacao,
              suporte: activityWithScales.suporte,
            });
          }

          // Adicionar tentativas de ajuda (desempenhou com ajuda)
          for (let i = 0; i < activity.counts.desempenhouComAjuda; i++) {
            registros.push({
              tentativa: tentativaCounter++,
              resultado: 'ajuda',
              stimulusId: activity.activityId,
              stimulusLabel: activity.activityName,
              durationMinutes: activity.durationMinutes,
              participacao: activityWithScales.participacao,
              suporte: activityWithScales.suporte,
            });
          }

          // Adicionar tentativas de acerto (desempenhou)
          for (let i = 0; i < activity.counts.desempenhou; i++) {
            registros.push({
              tentativa: tentativaCounter++,
              resultado: 'acerto',
              stimulusId: activity.activityId,
              stimulusLabel: activity.activityName,
              durationMinutes: activity.durationMinutes,
              participacao: activityWithScales.participacao,
              suporte: activityWithScales.suporte,
            });
          }
        });
      }

      return {
        id: s.id,
        pacienteId: patientId,
        terapeutaId: 'therapist-001',
        terapeutaNome: s.therapistName || 'Mariana Santos',
        data: s.date,
        programa: mockMusiProgram?.name || 'Programa de Expressão Musical e Ritmo',
        objetivo: mockMusiProgram?.goalDescription || 'Desenvolver habilidades de expressão musical',
        prazoInicio: '',
        prazoFim: '',
        observacoes: s.observacoes ?? undefined,
        registros,
        area: 'musicoterapia',
      };
    });

    return result;
  }

  // Senão, retornar sessões de Fono (padrão)
  const { mockRecentSessions } = await import(
    '@/features/programas/detalhe-ocp/mocks/sessions.mock'
  );
  const { mockProgramDetail } = await import(
    '@/features/programas/detalhe-ocp/mocks/program.mock'
  );

  const stimuli = mockProgramDetail.stimuli;
  const prazoInicio = mockProgramDetail.createdAt;
  const prazoFim = new Date(new Date(prazoInicio).getTime() + 90 * 24 * 60 * 60 * 1000)
    .toISOString();

  return mockRecentSessions.map((s) => {
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
      area: 'fonoaudiologia',
    };
  });
}

/**
 * ⚠️ FUNÇÃO TEMPORÁRIA: Processa filtros/ordenação/paginação localmente
 * 
 * Esta função será REMOVIDA quando o backend implementar paginação server-side.
 * Permite que o frontend funcione AGORA com URL params, sem quebrar quando o backend evoluir.
 */
function processSessionsLocally(
  allSessions: Sessao[],
  filters: SessionListFilters
): SessionListResponse {
  const {
    q = '',
    dateRange = 'all',
    programId = '',
    therapistId = '',
    sort = 'date-desc',
    page = 1,
    pageSize = 10
  } = filters;

  let filtered = [...allSessions];

  // Filtro por busca de texto
  if (q) {
    const searchLower = q.toLowerCase();
    filtered = filtered.filter(session =>
      session.programa?.toLowerCase().includes(searchLower) ||
      session.objetivo?.toLowerCase().includes(searchLower)
    );
  }

  // Filtro por período
  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    const cutoffDate = new Date();
    
    if (dateRange === 'last7') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (dateRange === 'last30') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (dateRange === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }

    filtered = filtered.filter(session => {
      const sessionDate = new Date(session.data);
      return sessionDate >= cutoffDate;
    });
  }

  // Filtro por programa
  if (programId) {
    filtered = filtered.filter(session => session.programa === programId);
  }

  // Filtro por terapeuta
  if (therapistId) {
    filtered = filtered.filter(session => session.terapeutaId === therapistId);
  }

  // Ordenação
  if (sort) {
    filtered.sort((a, b) => {
      if (sort === 'date-desc') {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      }
      if (sort === 'date-asc') {
        return new Date(a.data).getTime() - new Date(b.data).getTime();
      }
      if (sort === 'program') {
        return (a.programa || '').localeCompare(b.programa || '');
      }
      return 0;
    });
  }

  // Paginação
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = filtered.slice(startIndex, endIndex);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getSessionById(
  patientId: string,
  sessionId: string,
  area: string
): Promise<Sessao | null> {
  const response = await listSessionsByPatient(patientId, area);
  return response.items.find((s) => s.id === sessionId) ?? null;
}

export async function findSessionById(
  sessionId: string,
  patientId?: string,
  area: string = 'fonoaudiologia'
): Promise<Sessao | null> {
  if (shouldUseMock(area)) {
    let targetPatientId = patientId;
    
    // Se não foi fornecido patientId, usa o patientId mock da área correspondente
    if (!targetPatientId) {
      if (area === 'musicoterapia') {
        const { mockMusiProgram } = await import('@/features/programas/variants/musicoterapia/mocks/programMock');
        targetPatientId = mockMusiProgram.patientId;
      } else if (area === 'terapia-ocupacional') {
        targetPatientId = 'b6f174c5-87bc-4946-9bff-2eaf72d977b9';
      } else {
        const { mockProgramDetail } = await import('@/features/programas/detalhe-ocp/mocks/program.mock');
        targetPatientId = mockProgramDetail.patientId;
      }
    }
    
    const response = await listSessionsByPatient(targetPatientId, area);
    return response.items.find((s) => s.id === sessionId) ?? null;
  }
  return null;
}

export async function findProgramSessionById(sessionId: string, area?: string): Promise<ProgramDetail | null> {
  // Detectar área pelo prefixo do sessionId
  const detectedArea = area || (sessionId.includes('musi') ? 'musicoterapia' : 
    sessionId.includes('to-') ? 'terapia-ocupacional' : 
    sessionId.includes('sess-') ? 'terapia-ocupacional' : 'fonoaudiologia');
  
  // Usar mocks apenas para musicoterapia e fisioterapia
  if (shouldUseMock(detectedArea)) {
    if (detectedArea === 'musicoterapia') {
      const { mockMusiProgram } = await import('@/features/programas/variants/musicoterapia/mocks/programMock');
      return {
        ...mockMusiProgram,
        stimuli: mockMusiProgram.stimuli.map((s: any) => ({
          id: s.id,
          label: s.label,
          description: s.description || '',
          metodos: s.metodos || null,
          tecnicasProcedimentos: s.tecnicasProcedimentos || null,
          active: s.active,
          order: s.order,
        })),
      } as unknown as ProgramDetail;
    }
    
    // Fisioterapia e outras áreas com mock usam o mock genérico
    const { mockProgramDetail } = await import('@/features/programas/detalhe-ocp/mocks/program.mock');
    return mockProgramDetail;
  }
  
  try {
    const res = await fetch(`/api/ocp/sessions/${sessionId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error(`Erro ao buscar a sessão: ${res.statusText}`);
    
    const data = await res.json();
    if (!data) return null;
    return data.data;
  } catch (error) {
    console.warn('Erro ao buscar programa da sessão da API, usando mock:', error);
    return null;
  }
}

export function resumirSessao(sessao: Sessao): ResumoSessao {
  const total = sessao.registros.length;
  const acertos = sessao.registros.filter((r) => r.resultado === 'acerto' || r.resultado === 'ajuda').length;
  const independentes = sessao.registros.filter((r) => r.resultado === 'acerto').length;
  return {
    acerto: total > 0 ? Math.round((acertos / total) * 100) : 0,
    independencia: total > 0 ? Math.round((independentes / total) * 100) : 0,
    tentativas: total,
  };
}
