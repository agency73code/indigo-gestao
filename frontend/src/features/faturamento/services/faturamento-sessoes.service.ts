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
 * @todo Backend ainda não implementou esta rota - usar mock por enquanto
 */
export async function getFaturamentoById(id: string): Promise<ItemFaturamento | null> {
    if (faturamentoConfig.useMock) {
        return mocks.mockGetFaturamentoById(id);
    }

    // TODO: Backend precisa implementar GET /api/faturamentos/lancamentos/:id
    const res = await authFetch(`/api/faturamentos/lancamentos/${id}`);
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
 * Usa a MESMA rota do resumo, mas SEM filtro de terapeutaId para ver todos
 * Rota: GET /api/faturamentos/resumo (sem terapeutaId)
 */
export async function getResumoGerente(
    filters?: FaturamentoListFilters
): Promise<ResumoGerente> {
    if (faturamentoConfig.useMock) {
        return mocks.mockGetResumoGerente(filters);
    }

    // Gerente NÃO passa terapeutaId - vê todos os lançamentos
    const params = new URLSearchParams();
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters?.dataFim) params.append('dataFim', filters.dataFim);
    if (filters?.clienteId) params.append('clienteId', filters.clienteId);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

    const queryString = params.toString();
    const url = `/api/faturamentos/resumo${queryString ? `?${queryString}` : ''}`;

    const res = await authFetch(url);
    if (!res.ok) {
        throw new Error('Erro ao buscar resumo de faturamento');
    }

    // Mapear resposta do backend para o tipo ResumoGerente do frontend
    const data = await res.json();
    
    return {
        totalTerapeutas: data.totalTerapeutas ?? 0,
        totalClientes: data.totalClientes ?? 0,
        totalHoras: data.totalHoras ?? '0h',
        totalValorTerapeuta: data.totalValor ?? 0,
        totalValorCliente: data.totalValorCliente ?? 0,
        pendentesAprovacao: data.porStatus?.pendentes ?? 0,
        valorPendenteTerapeuta: data.valorPendenteTerapeuta ?? 0,
        valorPendenteCliente: data.valorPendenteCliente ?? 0,
        aprovadosPeriodo: data.porStatus?.aprovados ?? 0,
        valorAprovadoTerapeuta: data.valorAprovadoTerapeuta ?? 0,
        valorAprovadoCliente: data.valorAprovadoCliente ?? 0,
        porTipoAtividade: data.porTipoAtividade ?? [],
        topPendentes: data.topPendentes ?? [],
    };
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
 * Rota: POST /api/faturamentos/lancamentos/:id/aprovar
 * @param id - ID do lançamento (formato: "sessao-123" ou "ata-456")
 * @param valorAjudaCusto - Valor de ajuda de custo (opcional)
 * @param valorTotalCliente - Valor que o cliente paga (opcional)
 * @todo Backend precisa implementar esta rota
 */
export async function aprovarLancamento(
    id: string, 
    valorAjudaCusto?: number,
    valorTotalCliente?: number
): Promise<ItemFaturamento | null> {
    if (faturamentoConfig.useMock) {
        return mocks.mockAprovarLancamento(id);
    }

    const res = await authFetch(`/api/faturamentos/lancamentos/${id}/aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            valorAjudaCusto,
            valorTotalCliente,
        }),
    });
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message ?? 'Erro ao aprovar lançamento');
    }
    
    return res.json();
}

/**
 * Rejeita lançamento
 * Rota: POST /api/faturamentos/lancamentos/:id/rejeitar
 * @param id - ID do lançamento
 * @param motivo - Motivo da rejeição (obrigatório)
 * @todo Backend precisa implementar esta rota
 */
export async function rejeitarLancamento(id: string, motivo: string): Promise<ItemFaturamento | null> {
    if (faturamentoConfig.useMock) {
        return mocks.mockRejeitarLancamento(id, motivo);
    }

    const res = await authFetch(`/api/faturamentos/lancamentos/${id}/rejeitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
    });
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message ?? 'Erro ao rejeitar lançamento');
    }
    
    return res.json();
}

/**
 * Aprova múltiplos lançamentos em lote
 * Chama aprovarLancamento individualmente para cada ID
 * @param ids - Lista de IDs dos lançamentos
 * @param valoresCliente - Mapa opcional de ID -> valor que o cliente paga
 */
export async function aprovarEmLote(
    ids: string[],
    valoresCliente?: Record<string, number>
): Promise<{ sucesso: number; erros: number }> {
    let sucesso = 0;
    let erros = 0;

    for (const id of ids) {
        try {
            const valorCliente = valoresCliente?.[id];
            await aprovarLancamento(id, undefined, valorCliente);
            sucesso++;
        } catch {
            erros++;
        }
    }

    return { sucesso, erros };
}

/**
 * Aprova múltiplos lançamentos via endpoint de lote
 * Rota: POST /api/faturamentos/aprovar-lote
 * @param ids - Lista de IDs dos lançamentos
 * @param valoresCliente - Mapa opcional de ID -> valor que o cliente paga
 * @todo Backend precisa implementar esta rota
 */
export async function aprovarLancamentos(
    ids: string[],
    valoresCliente?: Record<string, number>
): Promise<void> {
    if (faturamentoConfig.useMock) {
        // Simula delay de processamento
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        return;
    }

    const res = await authFetch('/api/faturamentos/aprovar-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            ids,
            valoresCliente, // { "sessao-1": 150.00, "ata-2": 200.00 }
        }),
    });
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message ?? 'Erro ao aprovar lançamentos em lote');
    }
}

// ============================================
// DOWNLOAD DE ARQUIVOS
// ============================================

/**
 * Gera URL para download de arquivo de faturamento
 * ✅ Backend implementado: GET /api/faturamentos/arquivos/:fileId/download
 */
export function getDownloadUrl(fileId: number | string): string {
    return `/api/faturamentos/arquivos/${fileId}/download`;
}
