/**
 * Serviço de Atas de Reunião
 * 
 * Este serviço utiliza mock data por padrão.
 * Para integrar com o backend real, altere USE_MOCK para false
 * e implemente as chamadas de API usando authFetch.
 */

import { authFetch } from '@/lib/http';
import type {
    AtaReuniao,
    AtaListFilters,
    AtaListResponse,
    CreateAtaInput,
    UpdateAtaInput,
    TerapeutaOption,
    ClienteOption,
    CabecalhoAta,
} from '../types';

import {
    listAtasMock,
    getAtaByIdMock,
    createAtaMock,
    updateAtaMock,
    deleteAtaMock,
    finalizarAtaMock,
    generateSummaryMock,
    listTerapeutasMock,
    listClientesMock,
    getTerapeutaLogadoMock,
} from './mocks/atas.mock';

// Toggle para usar mock ou API real
// TODO: Mudar para false quando o backend estiver pronto
const USE_MOCK = true;

// ============================================
// ATAS CRUD
// ============================================

/**
 * Lista atas de reunião com filtros e paginação
 */
export async function listAtas(filters?: AtaListFilters): Promise<AtaListResponse> {
    if (USE_MOCK) {
        return listAtasMock(filters);
    }

    // TODO: Implementar chamada real
    const queryParams = new URLSearchParams();
    if (filters?.q) queryParams.append('q', filters.q);
    if (filters?.finalidade && filters.finalidade !== 'all') {
        queryParams.append('finalidade', filters.finalidade);
    }
    if (filters?.dataInicio) queryParams.append('dataInicio', filters.dataInicio);
    if (filters?.dataFim) queryParams.append('dataFim', filters.dataFim);
    if (filters?.clienteId) queryParams.append('clienteId', filters.clienteId);
    if (filters?.page) queryParams.append('page', String(filters.page));
    if (filters?.pageSize) queryParams.append('pageSize', String(filters.pageSize));

    const res = await authFetch(`/api/atas-reuniao?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Falha ao carregar atas de reunião');
    return res.json();
}

/**
 * Busca uma ata por ID
 */
export async function getAtaById(id: string): Promise<AtaReuniao | null> {
    if (USE_MOCK) {
        return getAtaByIdMock(id);
    }

    // TODO: Implementar chamada real
    const res = await authFetch(`/api/atas-reuniao/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Falha ao carregar ata');
    return res.json();
}

/**
 * Cria uma nova ata de reunião
 */
export async function createAta(input: CreateAtaInput): Promise<AtaReuniao> {
    if (USE_MOCK) {
        return createAtaMock(input);
    }

    // TODO: Implementar chamada real
    const res = await authFetch('/api/atas-reuniao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Falha ao criar ata');
    return res.json();
}

/**
 * Atualiza uma ata existente
 */
export async function updateAta(id: string, input: UpdateAtaInput): Promise<AtaReuniao | null> {
    if (USE_MOCK) {
        return updateAtaMock(id, input);
    }

    // TODO: Implementar chamada real
    const res = await authFetch(`/api/atas-reuniao/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Falha ao atualizar ata');
    return res.json();
}

/**
 * Remove uma ata
 */
export async function deleteAta(id: string): Promise<boolean> {
    if (USE_MOCK) {
        return deleteAtaMock(id);
    }

    // TODO: Implementar chamada real
    const res = await authFetch(`/api/atas-reuniao/${id}`, { method: 'DELETE' });
    return res.ok;
}

/**
 * Finaliza uma ata (muda status de rascunho para finalizada)
 */
export async function finalizarAta(id: string): Promise<AtaReuniao | null> {
    if (USE_MOCK) {
        return finalizarAtaMock(id);
    }

    // TODO: Implementar chamada real
    const res = await authFetch(`/api/atas-reuniao/${id}/finalizar`, { method: 'POST' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Falha ao finalizar ata');
    return res.json();
}

// ============================================
// IA - GERAÇÃO DE RESUMO
// ============================================

/**
 * Gera um resumo automático da ata usando IA
 */
export async function generateSummary(id: string): Promise<string> {
    if (USE_MOCK) {
        return generateSummaryMock(id);
    }

    // TODO: Implementar chamada real
    const res = await authFetch(`/api/atas-reuniao/${id}/ai/summary`, { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao gerar resumo');
    const data = await res.json();
    return data.summary;
}

// ============================================
// DADOS AUXILIARES
// ============================================

/**
 * Lista terapeutas para seleção de participantes
 */
export async function listTerapeutas(): Promise<TerapeutaOption[]> {
    if (USE_MOCK) {
        return listTerapeutasMock();
    }

    // TODO: Implementar chamada real
    const res = await authFetch('/api/terapeutas?status=ATIVO');
    if (!res.ok) throw new Error('Falha ao carregar terapeutas');
    const data = await res.json();
    return data.map((t: any) => ({
        id: t.id,
        nome: t.nome,
        especialidade: t.area_atuacao,
        cargo: t.cargo,
        conselho: t.conselho,
        registroConselho: t.registro_conselho,
    }));
}

/**
 * Lista clientes para seleção
 */
export async function listClientes(): Promise<ClienteOption[]> {
    if (USE_MOCK) {
        return listClientesMock();
    }

    // TODO: Implementar chamada real
    const res = await authFetch('/api/clientes?status=ATIVO');
    if (!res.ok) throw new Error('Falha ao carregar clientes');
    const data = await res.json();
    return data.map((c: any) => ({
        id: c.id,
        nome: c.nome,
    }));
}

/**
 * Busca dados do terapeuta logado para o cabeçalho
 */
export async function getTerapeutaLogado(userId: string): Promise<CabecalhoAta> {
    if (USE_MOCK) {
        return getTerapeutaLogadoMock(userId);
    }

    // TODO: Implementar chamada real
    const res = await authFetch(`/api/terapeutas/${userId}`);
    if (!res.ok) throw new Error('Falha ao carregar dados do terapeuta');
    const data = await res.json();
    return {
        terapeutaId: data.id,
        terapeutaNome: data.nome,
        conselhoNumero: data.registro_conselho,
        conselhoTipo: data.conselho,
        profissao: data.area_atuacao,
        cargo: data.cargo,
    };
}
