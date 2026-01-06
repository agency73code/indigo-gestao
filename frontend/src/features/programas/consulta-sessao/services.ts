import { buildApiUrl } from '@/lib/api';
import type { Sessao, ResumoSessao, ProgramDetail, DateRange } from './types';
import type { AreaType } from '@/contexts/AreaContext';

/**
 * Parâmetros de filtragem para listagem de sessões
 */
export interface SessionListFilters {
  /** Termo de busca */
  q?: string;
  /** Período: 'all' | 'last7' | 'last30' | 'year' */
  dateRange?: DateRange;
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
  stimulusId?: string;
  periodStart?: string;
  periodEnd?: string;
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
    pageSize = 10, // TODO: passar isso aqui pro backend pra colocar em take
    stimulusId,
    periodStart,
    periodEnd,
  } = filters;

  const url = buildApiUrl(`/api/ocp/clients/${patientId}/sessions`, {
    area,
    q,
    periodMode: dateRange,
    programId,
    therapistId,
    sort,
    page,
    pageSize,
    stimulusId,
    periodStart,
    periodEnd,
  });

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) throw new Error(`Erro ao carregar sessões: ${res.status}`);
  
  const response = await res.json();
  const { items, total, totalPages } = response;
  
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
  _sessionId: string,
  _patientId?: string,
  _area: string = 'fonoaudiologia'
): Promise<Sessao | null> {
  return null;
}

export async function findProgramSessionById(sessionId: string, _area?: string): Promise<ProgramDetail | null> {
 
  try {
    const res = await fetch(`/api/ocp/sessions/${sessionId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error(`Erro ao buscar a sessão: ${res.statusText}`);
    const data = await res.json();
    console.log(data);
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
