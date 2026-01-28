/**
 * ============================================================================
 * SERVICE - FATURAMENTO (SESSÕES + ATAS)
 * ============================================================================
 * 
 * Serviço de faturamento que consulta dados de sessões e atas.
 * 
 * IMPORTANTE: Quando o backend estiver pronto, altere USE_MOCK para false
 * e implemente as chamadas reais à API.
 * ============================================================================
 */

import type {
    ItemFaturamento,
    FaturamentoListResponse,
    FaturamentoListFilters,
    ResumoFaturamento,
    ResumoGerente,
    ClienteOption,
    TerapeutaOption,
} from '../types/faturamento.types';

import * as mocks from './faturamento.mock';

// Flag para usar mock (altere para false quando o backend estiver pronto)
const USE_MOCK = true;

// ============================================
// LISTAGEM E BUSCA
// ============================================

/**
 * Lista lançamentos de faturamento (sessões + atas) com filtros
 */
export async function listFaturamento(
    filters: FaturamentoListFilters = {}
): Promise<FaturamentoListResponse> {
    if (USE_MOCK) {
        return mocks.mockListFaturamento(filters);
    }

    // TODO: Implementar chamada real à API quando o backend estiver pronto
    // const params = new URLSearchParams();
    // if (filters.q) params.append('q', filters.q);
    // ...etc
    // const res = await authFetch(`/api/faturamento?${params.toString()}`);
    // return res.json();
    
    return mocks.mockListFaturamento(filters);
}

/**
 * Busca lançamento por ID
 */
export async function getFaturamentoById(id: string): Promise<ItemFaturamento | null> {
    if (USE_MOCK) {
        return mocks.mockGetFaturamentoById(id);
    }

    // TODO: Implementar chamada real à API
    return mocks.mockGetFaturamentoById(id);
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
    if (USE_MOCK) {
        return mocks.mockGetResumoFaturamento(terapeutaId, filters);
    }

    // TODO: Implementar chamada real à API
    return mocks.mockGetResumoFaturamento(terapeutaId, filters);
}

/**
 * Calcula resumo de faturamento para o GERENTE (visão geral)
 */
export async function getResumoGerente(
    filters?: FaturamentoListFilters
): Promise<ResumoGerente> {
    if (USE_MOCK) {
        return mocks.mockGetResumoGerente(filters);
    }

    // TODO: Implementar chamada real à API
    return mocks.mockGetResumoGerente(filters);
}

// ============================================
// AUXILIARES
// ============================================

/**
 * Lista clientes disponíveis para seleção
 */
export async function listClientes(q?: string): Promise<ClienteOption[]> {
    if (USE_MOCK) {
        return mocks.mockListClientes(q);
    }

    // TODO: Implementar chamada real à API
    return mocks.mockListClientes(q);
}

/**
 * Busca dados do terapeuta logado
 */
export async function getTerapeutaLogado(): Promise<TerapeutaOption> {
    if (USE_MOCK) {
        return mocks.mockGetTerapeutaLogado();
    }

    // TODO: Implementar chamada real à API
    return mocks.mockGetTerapeutaLogado();
}

// ============================================
// AÇÕES DE GESTÃO
// ============================================

/**
 * Aprova lançamento
 */
export async function aprovarLancamento(id: string): Promise<ItemFaturamento | null> {
    if (USE_MOCK) {
        return mocks.mockAprovarLancamento(id);
    }

    // TODO: Implementar chamada real à API
    return mocks.mockAprovarLancamento(id);
}

/**
 * Rejeita lançamento
 */
export async function rejeitarLancamento(id: string, motivo: string): Promise<ItemFaturamento | null> {
    if (USE_MOCK) {
        return mocks.mockRejeitarLancamento(id, motivo);
    }

    // TODO: Implementar chamada real à API
    return mocks.mockRejeitarLancamento(id, motivo);
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
export async function aprovarLancamentos(_ids: string[]): Promise<void> {
    if (USE_MOCK) {
        // Simula delay de processamento
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        // Mock: atualiza status localmente (em produção seria uma chamada PUT/PATCH)
        return;
    }

    // TODO: Implementar chamada real à API
    // const res = await authFetch('/api/faturamento/aprovar-lote', {
    //     method: 'POST',
    //     body: JSON.stringify({ ids }),
    // });
    // if (!res.ok) throw new Error('Erro ao aprovar lançamentos');
}
