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

  // Construir URL com query params
  // ⚠️ TEMPORÁRIO: Backend atual não aceita query params, então chamamos sem eles
  // Quando backend implementar paginação, ele vai ignorar ou processar os params
  const url = new URL('/api/terapeutas', window.location.origin);
  
  // Apenas adiciona query params se tiver busca (backend pode ignorar)
  // Os outros params (page, pageSize, sort) serão processados localmente até backend implementar
  if (q) {
    url.searchParams.set('q', q);
  }

  // Fazer requisição SEM page/pageSize/sort por enquanto
  const res = await authFetch(url.pathname + url.search, { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha ao listar terapeutas (${res.status})`;
    throw new Error(msg);
  }

  // ============================================
  // 🔄 ADAPTER: Detecta formato da resposta
  // ============================================
  
  // Caso 1: Backend retorna array simples [ {...}, {...} ] ou vazio [] (FORMATO ATUAL)
  // ⚠️ IMPORTANTE: Verificar Array PRIMEIRO porque array também é typeof 'object'
  if (Array.isArray(data)) {
    // ⚠️ TEMPORÁRIO: Faz paginação/filtro/ordenação local até backend implementar
    let filtered = data as Therapist[];

    // Aplicar filtro de busca (local)
    if (q.trim()) {
      const searchLower = q.toLowerCase();
      filtered = filtered.filter(therapist => {
        const nome = therapist.nome?.toLowerCase() || '';
        const email = therapist.email?.toLowerCase() || '';
        const telefone = therapist.telefone || '';
        const registroConselho = therapist.registroConselho?.toLowerCase() || '';
        const especialidade = therapist.especialidade?.toLowerCase() || '';
        const cpf = therapist.pessoa?.cpf || '';
        
        return (
          nome.includes(searchLower) ||
          email.includes(searchLower) ||
          telefone.includes(searchLower) ||
          registroConselho.includes(searchLower) ||
          especialidade.includes(searchLower) ||
          cpf.includes(searchLower)
        );
      });
    }

    // Aplicar ordenação (local)
    const [field, direction] = sort.split('_') as [keyof Therapist, 'asc' | 'desc'];
    filtered.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      // Tratar valores nulos/undefined
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      // Comparação de strings
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal, 'pt-BR');
      } else {
        comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      
      return direction === 'desc' ? -comparison : comparison;
    });

    // Aplicar paginação (local)
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
  
  // Caso 2: Backend FUTURO retorna formato paginado { items, total, page, ... }
  if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
    return data as TherapistListResponse;
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
