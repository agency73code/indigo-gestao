import { authFetch } from '@/lib/http';
import type { Patient } from '../types/consultas.types';

/**
 * Parâmetros de filtragem para listagem de clientes/pacientes
 */
export interface PatientListParams {
  /** Termo de busca (nome, email, telefone, responsável, etc) */
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
export interface PatientListResponse {
  /** Lista de clientes/pacientes da página atual */
  items: Patient[];
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
 * Lista clientes/pacientes com filtros, ordenação e paginação
 * 
 * 🔄 ADAPTER: Funciona com backend atual (array) e futuro (objeto paginado)
 * 
 * TEMPORÁRIO: Faz paginação local enquanto backend não implementa
 * FUTURO: Quando backend retornar { items, total, ... }, usa direto
 * 
 * @param params - Parâmetros de filtragem
 * @returns Dados paginados de clientes/pacientes
 */
export async function listPatients(
  params: PatientListParams = {}
): Promise<PatientListResponse> {
  const { 
    q = '', 
    page = 1, 
    pageSize = 10, 
    sort = 'nome_asc' 
  } = params;

  // Construir URL com query params
  // ⚠️ TEMPORÁRIO: Backend atual não aceita query params, então chamamos sem eles
  // Quando backend implementar paginação, ele vai ignorar ou processar os params
  const url = new URL('/api/clientes', window.location.origin);
  
  // Apenas adiciona query params se tiver busca (backend pode ignorar)
  // Os outros params (page, pageSize, sort) serão processados localmente até backend implementar
  if (q) {
    url.searchParams.set('q', q);
  }

  // Fazer requisição SEM page/pageSize/sort por enquanto
  const res = await authFetch(url.pathname + url.search, { method: 'GET' });
  const text = await res.text();
  const response = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = response?.message ?? response?.error ?? `Falha ao listar clientes (${res.status})`;
    throw new Error(msg);
  }

  // ⚠️ IMPORTANTE: Backend de clientes retorna { normalized: [...] }
  // Extrair o array do campo 'normalized'
  const data = response?.normalized ?? response;
  
  console.log('🔍 [Patient Service] Resposta do backend:', { response, data });

  // ============================================
  // 🔄 ADAPTER: Detecta formato da resposta
  // ============================================
  
  // Caso 1: Backend retorna array simples [ {...}, {...} ] ou vazio [] (FORMATO ATUAL)
  // ⚠️ IMPORTANTE: Verificar Array PRIMEIRO porque array também é typeof 'object'
  if (Array.isArray(data)) {
    // ⚠️ TEMPORÁRIO: Faz paginação/filtro/ordenação local até backend implementar
    let filtered = data as Patient[];

    // Aplicar filtro de busca (local)
    if (q.trim()) {
      const searchLower = q.toLowerCase();
      filtered = filtered.filter(patient => {
        const nome = patient.nome?.toLowerCase() || '';
        const email = patient.email?.toLowerCase() || '';
        const telefone = patient.telefone || '';
        const responsavel = patient.responsavel?.toLowerCase() || '';
        const cpf = patient.pessoa?.cpf || '';
        
        return (
          nome.includes(searchLower) ||
          email.includes(searchLower) ||
          telefone.includes(searchLower) ||
          responsavel.includes(searchLower) ||
          cpf.includes(searchLower)
        );
      });
    }

    // Aplicar ordenação (local)
    const [field, direction] = sort.split('_') as [keyof Patient, 'asc' | 'desc'];
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
    return data as PatientListResponse;
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
