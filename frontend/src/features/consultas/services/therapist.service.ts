import { authFetch } from '@/lib/http';
import type { Therapist } from '../types/consultas.types';

/**
 * Parâmetros de filtragem para listagem de terapeutas
 */
export interface TherapistListParams {
  /** Termo de busca (nome, email, telefone, etc) */
  q?: string;
  /** Número da página (1-indexed) */
  page?: number;
  /** Quantidade de itens por página */
  pageSize?: number;
  /** Ordenação: campo_direção (ex: nome_asc, email_desc) */
  sort?: string;
}

/**
 * Resposta da API com dados paginados
 */
export interface TherapistListResponse {
  /** Lista de terapeutas da página atual */
  items: Therapist[];
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
 * Lista terapeutas com filtros, ordenação e paginação
 * 
 * 🔄 ADAPTER: Funciona com backend atual (array) e futuro (objeto paginado)
 * 
 * TEMPORÁRIO: Faz paginação local enquanto backend não implementa
 * FUTURO: Quando backend retornar { items, total, ... }, usa direto
 * 
 * @param params - Parâmetros de filtragem
 * @returns Dados paginados de terapeutas
 */
export async function listTherapists(
  params: TherapistListParams = {}
): Promise<TherapistListResponse> {
  const {
    q = '',
    page = 1,
    pageSize = 10,
    sort = 'nome_asc'
  } = params;

  // Construir URL com query params que o backend já aceita
  const url = new URL('/api/terapeutas', window.location.origin);
  
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('sort', sort);

  if (q) {
    url.searchParams.set('q', q);
  }

  const res = await authFetch(url.pathname + url.search, { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha ao listar terapeutas (${res.status})`;
    throw new Error(msg);
  }

  // Caso 1: Backend retorna formato paginado { success, items, total, page, ... }
  if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as any).items)) {
    const payload = data as Partial<TherapistListResponse> & { success?: boolean };

    return {
      items: payload.items ?? [],
      total: payload.total ?? 0,
      page: payload.page ?? page,
      pageSize: payload.pageSize ?? pageSize,
      totalPages: payload.totalPages ?? Math.ceil((payload.total ?? 0) / (payload.pageSize ?? pageSize)),
    };
  }

  // Caso 3: Formato inesperado - retorna vazio
  console.warn('Formato de resposta inesperado:', data);
  return {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  };
}
