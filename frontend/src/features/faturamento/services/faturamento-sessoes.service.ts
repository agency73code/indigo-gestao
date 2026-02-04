/**
 * ============================================================================
 * SERVICE - FATURAMENTO (SESSÕES + ATAS)
 * ============================================================================
 * 
 * Serviço de faturamento que consulta dados de sessões e atas.
 * 
 * IMPORTANTE: O mock é controlado pela variável de ambiente VITE_USE_MOCK_FATURAMENTO
 * - VITE_USE_MOCK_FATURAMENTO=true → usa mock
 * - VITE_USE_MOCK_FATURAMENTO=false ou não definido → usa API real
 * ============================================================================
 */

import { authFetch } from '@/lib/http';
import type {
    ItemFaturamento,
    FaturamentoListResponse,
    FaturamentoListFilters,
    ResumoFaturamento,
    ResumoGerente,
    ClienteOption,
    TerapeutaOption,
} from '../types/faturamento.types';

import { faturamentoConfig } from './faturamento.config';
import * as mocks from './faturamento.mock';

// ============================================
// LISTAGEM E BUSCA
// ============================================

/**
 * Lista lançamentos de faturamento (sessões + atas) com filtros [feito]
 */
export async function listFaturamento(
    filters: FaturamentoListFilters = {}
): Promise<FaturamentoListResponse> {
    if (faturamentoConfig.useMock) {
        return mocks.mockListFaturamento(filters);
    }

    // API real
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.terapeutaId) params.append('terapeutaId', filters.terapeutaId);
    if (filters.clienteId) params.append('clienteId', filters.clienteId);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters.dataFim) params.append('dataFim', filters.dataFim);
    if (filters.orderBy) params.append('orderBy', filters.orderBy);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.pageSize) params.append('pageSize', String(filters.pageSize));

    const res = await authFetch(`/api/faturamentos/lancamentos?${params.toString()}`);

    if (!res.ok) {
        throw new Error('Erro ao listar faturamento');
    }
    
    const data = await res.json();

    return data;
}

/**
 * Busca lançamento por ID
 */
export async function getFaturamentoById(id: string): Promise<ItemFaturamento | null> {
    if (faturamentoConfig.useMock) {
        return mocks.mockGetFaturamentoById(id);
    }

    const res = await authFetch(`/api/faturamento/lancamentos/${id}`);
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Erro ao buscar lançamento');
    }
    return res.json();
}

// ============================================
// RESUMOS E ESTATÍSTICAS
// ============================================

/**
 * Calcula resumo de faturamento do terapeuta
 */
export async function getResumoFaturamento(
    terapeutaId?: string,
    filters?: FaturamentoListFilters
): Promise<ResumoFaturamento> {
    if (faturamentoConfig.useMock) {
        return mocks.mockGetResumoFaturamento(terapeutaId, filters);
    }

    const params = new URLSearchParams();
    if (terapeutaId) params.append('terapeutaId', terapeutaId);
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters?.dataFim) params.append('dataFim', filters.dataFim);

    const res = await authFetch(`/api/faturamentos/resumo?${params.toString()}`);
    if (!res.ok) {
        throw new Error('Erro ao buscar resumo de faturamento');
    }

    return res.json();
}

/**
 * Calcula resumo de faturamento para o GERENTE (visão geral)
 */
export async function getResumoGerente(
    filters?: FaturamentoListFilters
): Promise<ResumoGerente> {
    console.log('teste')
    if (faturamentoConfig.useMock) {
        return mocks.mockGetResumoGerente(filters);
    }

    const params = new URLSearchParams();
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters?.dataFim) params.append('dataFim', filters.dataFim);

    const res = await authFetch(`/api/faturamento/resumo-gerente?${params.toString()}`);
    if (!res.ok) {
        throw new Error('Erro ao buscar resumo gerente');
    }
    return res.json();
}

// ============================================
// AUXILIARES
// ============================================

/**
 * Lista clientes disponíveis para seleção
 */
export async function listClientes(q?: string): Promise<ClienteOption[]> {
    if (faturamentoConfig.useMock) {
        return mocks.mockListClientes(q);
    }

    const params = new URLSearchParams();
    if (q) params.append('q', q);

    const res = await authFetch(`/api/clientes?${params.toString()}`);
    if (!res.ok) {
        throw new Error('Erro ao listar clientes');
    }
    return res.json();
}

/**
 * Busca dados do terapeuta logado
 */
export async function getTerapeutaLogado(): Promise<TerapeutaOption> {
    if (faturamentoConfig.useMock) {
        return mocks.mockGetTerapeutaLogado();
    }

    const res = await authFetch(`/api/auth/me`);

    if (!res.ok) {
        throw new Error('Erro ao buscar terapeuta logado');
    }

    const data = await res.json();

    return {
        id: data.user.id,
        nome: data.user.name,
        avatarUrl: data.user.avatar_url ?? null,
    };
}

// ============================================
// AÇÕES DE GESTÃO
// ============================================

/**
 * Aprova lançamento
 */
export async function aprovarLancamento(
    id: string | number, 
    valorAjudaCusto?: number
): Promise<ItemFaturamento | null> {
    const res = await authFetch(`/api/faturamentos/lancamentos/${id}/aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valorAjudaCusto }),
    });
    if (!res.ok) {
        throw new Error('Erro ao aprovar lançamento');
    }
    return res.json();
}

/**
 * Rejeita lançamento
 */
export async function rejeitarLancamento(id: string, motivo: string): Promise<ItemFaturamento | null> {
    if (faturamentoConfig.useMock) {
        return mocks.mockRejeitarLancamento(id, motivo);
    }

    const res = await authFetch(`/api/faturamento/lancamentos/${id}/rejeitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
    });
    if (!res.ok) {
        throw new Error('Erro ao rejeitar lançamento');
    }
    return res.json();
}

/**
 * Aprova múltiplos lançamentos em lote
 */
export async function aprovarEmLote(ids: string[]): Promise<{ sucesso: number; erros: number }> {
    let sucesso = 0;
    let erros = 0;

    for (const id of ids) {
        try {
            await aprovarLancamento(id);
            sucesso++;
        } catch {
            erros++;
        }
    }

    return { sucesso, erros };
}

/**
 * Aprova múltiplos lançamentos (usa aprovarEmLote internamente)
 */
export async function aprovarLancamentos(ids: string[]): Promise<void> {
    if (faturamentoConfig.useMock) {
        // Simula delay de processamento
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        return;
    }

    const res = await authFetch('/api/faturamento/aprovar-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
        throw new Error('Erro ao aprovar lançamentos');
    }
}
