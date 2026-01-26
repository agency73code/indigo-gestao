/**
 * ============================================================================
 * SERVICE - FATURAMENTO
 * ============================================================================
 * 
 * Serviço de faturamento para lançamento de horas.
 * Preparado para integração com backend.
 * 
 * Quando o backend estiver pronto:
 * 1. Implementar as funções com authFetch
 * 2. Remover importações de mock
 * 3. Remover flag useMock do config
 * ============================================================================
 */

import { authFetch } from '@/lib/http';
import type {
    Lancamento,
    LancamentoListFilters,
    LancamentoListResponse,
    CreateLancamentoInput,
    UpdateLancamentoInput,
    ClienteOption,
    TerapeutaOption,
    ResumoHorasTerapeuta,
    ResumoGestao,
} from '../types';

import { faturamentoConfig } from './faturamento.config';

// Importar mocks (remover após implementação do backend)
import * as mocks from './mocks/faturamento.mock';

// ============================================
// HELPERS - MAPEAMENTO API ↔ FRONTEND
// ============================================

/**
 * Converte resposta do backend (snake_case) para frontend (camelCase)
 * Implementar quando o backend estiver pronto
 */
function mapLancamentoFromApi(data: unknown): Lancamento {
    // TODO: Implementar mapeamento quando o backend estiver pronto
    return data as Lancamento;
}

/**
 * Converte input do frontend para formato do backend
 * Implementar quando o backend estiver pronto
 */
function mapCreateLancamentoToApi(input: CreateLancamentoInput): Record<string, unknown> {
    // TODO: Implementar mapeamento quando o backend estiver pronto
    return {
        cliente_id: input.clienteId,
        data: input.data,
        horario_inicio: input.horarioInicio,
        horario_fim: input.horarioFim,
        tipo_atividade: input.tipoAtividade,
        is_homecare: input.isHomecare,
        observacoes: input.observacoes,
    };
}

// ============================================
// CRUD - LANÇAMENTOS
// ============================================

/**
 * Lista lançamentos com filtros e paginação
 */
export async function listLancamentos(
    filters: LancamentoListFilters = {}
): Promise<LancamentoListResponse> {
    if (faturamentoConfig.useMock) {
        return mocks.mockListLancamentos(filters);
    }

    // TODO: Implementar chamada real à API
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.terapeutaId) params.append('terapeuta_id', filters.terapeutaId);
    if (filters.clienteId) params.append('cliente_id', filters.clienteId);
    if (filters.tipoAtividade && filters.tipoAtividade !== 'all') {
        params.append('tipo_atividade', filters.tipoAtividade);
    }
    if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
    }
    if (filters.dataInicio) params.append('data_inicio', filters.dataInicio);
    if (filters.dataFim) params.append('data_fim', filters.dataFim);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.pageSize) params.append('page_size', String(filters.pageSize));

    const res = await authFetch(`/api/faturamento/lancamentos?${params.toString()}`, {
        method: 'GET',
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message ?? 'Falha ao listar lançamentos');
    }

    return {
        items: (data.items || []).map(mapLancamentoFromApi),
        total: data.total || 0,
        page: data.page || 1,
        pageSize: data.page_size || 10,
        totalPages: Math.ceil((data.total || 0) / (data.page_size || 10)),
    };
}

/**
 * Busca lançamento por ID
 */
export async function getLancamento(id: string): Promise<Lancamento | null> {
    if (faturamentoConfig.useMock) {
        return mocks.mockGetLancamento(id);
    }

    try {
        const res = await authFetch(`/api/faturamento/lancamentos/${id}`, {
            method: 'GET',
        });
        const data = await res.json();
        return mapLancamentoFromApi(data);
    } catch {
        return null;
    }
}

/**
 * Cria novo lançamento
 */
export async function createLancamento(
    input: CreateLancamentoInput,
    terapeutaId: string
): Promise<Lancamento> {
    if (faturamentoConfig.useMock) {
        return mocks.mockCreateLancamento(input, terapeutaId);
    }

    // Preparar FormData para suportar upload de arquivos
    const formData = new FormData();
    const payload = mapCreateLancamentoToApi(input);
    
    for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    }

    // Adicionar anexos se houver
    if (input.anexos) {
        for (const anexo of input.anexos) {
            formData.append('anexos', anexo.file, anexo.nome);
        }
    }

    const res = await authFetch('/api/faturamento/lancamentos', {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message ?? 'Falha ao criar lançamento');
    }

    return mapLancamentoFromApi(data);
}

/**
 * Atualiza lançamento existente
 */
export async function updateLancamento(
    id: string,
    input: UpdateLancamentoInput
): Promise<Lancamento | null> {
    if (faturamentoConfig.useMock) {
        return mocks.mockUpdateLancamento(id, input);
    }

    const res = await authFetch(`/api/faturamento/lancamentos/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message ?? 'Falha ao atualizar lançamento');
    }

    return mapLancamentoFromApi(data);
}

/**
 * Deleta lançamento
 */
export async function deleteLancamento(id: string): Promise<boolean> {
    if (faturamentoConfig.useMock) {
        return mocks.mockDeleteLancamento(id);
    }

    const res = await authFetch(`/api/faturamento/lancamentos/${id}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        throw new Error('Falha ao excluir lançamento');
    }

    return true;
}

// ============================================
// AÇÕES DE GESTÃO (GERENTE)
// ============================================

/**
 * Aprova lançamento
 */
export async function aprovarLancamento(id: string): Promise<Lancamento | null> {
    return updateLancamento(id, { status: 'aprovado' });
}

/**
 * Rejeita lançamento
 */
export async function rejeitarLancamento(
    id: string,
    motivo: string
): Promise<Lancamento | null> {
    return updateLancamento(id, { 
        status: 'rejeitado',
        motivoRejeicao: motivo,
    });
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

// ============================================
// AUXILIARES
// ============================================

/**
 * Lista clientes disponíveis para seleção
 */
export async function listClientes(
    q?: string
): Promise<ClienteOption[]> {
    if (faturamentoConfig.useMock) {
        const clientes = await mocks.mockListClientes();
        if (q) {
            const query = q.toLowerCase();
            return clientes.filter(c => c.nome.toLowerCase().includes(query));
        }
        return clientes;
    }

    const params = new URLSearchParams();
    if (q) params.append('q', q);

    const res = await authFetch(`/api/clientes/select?${params.toString()}`, {
        method: 'GET',
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message ?? 'Falha ao listar clientes');
    }

    return (data.items || []).map((c: { id: string; nome: string; avatar_url?: string }) => ({
        id: c.id,
        nome: c.nome,
        avatarUrl: c.avatar_url,
    }));
}

/**
 * Lista terapeutas disponíveis para seleção
 */
export async function listTerapeutas(): Promise<TerapeutaOption[]> {
    if (faturamentoConfig.useMock) {
        return mocks.mockListTerapeutas();
    }

    const res = await authFetch('/api/terapeutas/select', {
        method: 'GET',
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message ?? 'Falha ao listar terapeutas');
    }

    return data.items as TerapeutaOption[];
}

/**
 * Busca dados do terapeuta logado
 */
export async function getTerapeutaLogado(): Promise<TerapeutaOption> {
    if (faturamentoConfig.useMock) {
        return mocks.mockGetTerapeutaLogado();
    }

    const res = await authFetch('/api/terapeutas/me', {
        method: 'GET',
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message ?? 'Falha ao buscar terapeuta logado');
    }

    return data as TerapeutaOption;
}

// ============================================
// RESUMOS E ESTATÍSTICAS
// ============================================

/**
 * Resumo de horas do terapeuta
 */
export async function getResumoTerapeuta(
    terapeutaId: string,
    periodoInicio?: string,
    periodoFim?: string
): Promise<ResumoHorasTerapeuta> {
    if (faturamentoConfig.useMock) {
        return mocks.mockGetResumoTerapeuta(terapeutaId, periodoInicio, periodoFim);
    }

    const params = new URLSearchParams();
    if (periodoInicio) params.append('periodo_inicio', periodoInicio);
    if (periodoFim) params.append('periodo_fim', periodoFim);

    const res = await authFetch(`/api/faturamento/resumo/terapeuta/${terapeutaId}?${params.toString()}`, {
        method: 'GET',
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message ?? 'Falha ao buscar resumo');
    }

    return data as ResumoHorasTerapeuta;
}

/**
 * Resumo para gestão (gerente)
 */
export async function getResumoGestao(
    periodoInicio?: string,
    periodoFim?: string
): Promise<ResumoGestao> {
    if (faturamentoConfig.useMock) {
        return mocks.mockGetResumoGestao(periodoInicio, periodoFim);
    }

    const params = new URLSearchParams();
    if (periodoInicio) params.append('periodo_inicio', periodoInicio);
    if (periodoFim) params.append('periodo_fim', periodoFim);

    const res = await authFetch(`/api/faturamento/resumo/gestao?${params.toString()}`, {
        method: 'GET',
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message ?? 'Falha ao buscar resumo de gestão');
    }

    return data as ResumoGestao;
}
