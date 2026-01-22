/**
 * Mock Service para Prontuário Psicológico
 * 
 * Este arquivo contém APENAS implementações de mock para desenvolvimento.
 * Para API real, veja: ../psicoterapia.service.ts
 * 
 * PARA REMOVER MOCK EM PRODUÇÃO:
 * 1. Defina VITE_USE_MOCK_PSICOTERAPIA=false no .env
 * 2. Ou simplesmente delete este arquivo e atualize index.ts
 */

import type { 
    ProntuarioPsicologico,
    ProntuarioFormData,
    ProntuarioResponse,
    ProntuarioListResult,
    ProntuarioListFilters,
    EvolucaoTerapeutica,
    EvolucaoFormData,
    EvolucaoResponse,
} from '../../types';
import { mockProntuario, mockProntuariosList } from '../../mock';

// ============================================
// HELPERS
// ============================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function debugLog(message: string, ...args: unknown[]) {
    if (import.meta.env.DEV) {
        console.log(`[MOCK] ${message}`, ...args);
    }
}

// ============================================
// PRONTUÁRIOS - MOCK
// ============================================

/**
 * Listar prontuários (MOCK)
 */
export async function listarProntuarios(
    filtros: ProntuarioListFilters = {}
): Promise<ProntuarioListResult> {
    await delay(300);
    
    let items = [...mockProntuariosList];
    
    // Aplicar filtro de busca
    if (filtros.q) {
        const termo = filtros.q.toLowerCase();
        items = items.filter(p => 
            p.clienteNome.toLowerCase().includes(termo) ||
            p.terapeutaNome.toLowerCase().includes(termo)
        );
    }
    
    // Aplicar filtro de status
    if (filtros.status && filtros.status !== 'todos') {
        items = items.filter(p => p.status === filtros.status);
    }
    
    const page = filtros.page || 1;
    const pageSize = filtros.pageSize || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    debugLog('listarProntuarios', { filtros, total });
    
    return {
        items: items.slice(start, end),
        total,
        page,
        pageSize,
        totalPages,
    };
}

/**
 * Buscar prontuário por ID (MOCK)
 */
export async function buscarProntuario(id: string): Promise<ProntuarioPsicologico | null> {
    await delay(300);
    debugLog('buscarProntuario', { id });
    
    if (id === '1') return mockProntuario;
    return null;
}

/**
 * Buscar prontuário por ID do cliente (MOCK)
 */
export async function buscarProntuarioPorCliente(clienteId: string): Promise<ProntuarioPsicologico | null> {
    await delay(300);
    debugLog('buscarProntuarioPorCliente', { clienteId });
    
    if (clienteId === 'client-001') return mockProntuario;
    return null;
}

/**
 * Criar prontuário (MOCK)
 */
export async function criarProntuario(data: ProntuarioFormData): Promise<ProntuarioResponse> {
    await delay(500);
    debugLog('criarProntuario', data);
    
    return {
        success: true,
        data: { ...mockProntuario, id: String(Date.now()) },
        message: 'Prontuário criado com sucesso',
    };
}

/**
 * Atualizar prontuário (MOCK)
 */
export async function atualizarProntuario(
    id: string, 
    data: Partial<ProntuarioFormData>
): Promise<ProntuarioResponse> {
    await delay(500);
    debugLog('atualizarProntuario', { id, data });
    
    return {
        success: true,
        data: mockProntuario,
        message: 'Prontuário atualizado com sucesso',
    };
}

// ============================================
// EVOLUÇÕES - MOCK
// ============================================

/**
 * Criar nova evolução (MOCK)
 */
export async function criarEvolucao(data: EvolucaoFormData): Promise<EvolucaoResponse> {
    await delay(500);
    debugLog('criarEvolucao', data);
    
    const novaEvolucao: EvolucaoTerapeutica = {
        id: String(Date.now()),
        numeroSessao: mockProntuario.evolucoes.length + 1,
        dataEvolucao: data.dataEvolucao,
        descricaoSessao: data.descricaoSessao,
        arquivos: data.arquivos.filter(a => !a.removed),
        criadoEm: new Date().toISOString(),
    };
    
    return {
        success: true,
        data: novaEvolucao,
        message: 'Evolução registrada com sucesso',
    };
}

/**
 * Listar evoluções de um prontuário (MOCK)
 */
export async function listarEvolucoes(prontuarioId: string): Promise<EvolucaoTerapeutica[]> {
    await delay(300);
    debugLog('listarEvolucoes', { prontuarioId });
    
    return mockProntuario.evolucoes;
}

/**
 * Buscar evolução por ID (MOCK)
 */
export async function buscarEvolucao(
    prontuarioId: string, 
    evolucaoId: string
): Promise<EvolucaoTerapeutica | null> {
    await delay(300);
    debugLog('buscarEvolucao', { prontuarioId, evolucaoId });
    
    return mockProntuario.evolucoes.find(e => e.id === evolucaoId) || null;
}

// ============================================
// VERIFICAÇÕES - MOCK
// ============================================

/**
 * Verificar se cliente já possui prontuário (MOCK)
 */
export async function verificarProntuarioExistente(clienteId: string): Promise<boolean> {
    const prontuario = await buscarProntuarioPorCliente(clienteId);
    return prontuario !== null;
}

/**
 * Atualizar evolução existente (MOCK)
 */
export async function atualizarEvolucao(
    prontuarioId: string,
    evolucaoId: string,
    data: Partial<EvolucaoFormData>
): Promise<EvolucaoResponse> {
    await delay(500);
    debugLog('atualizarEvolucao', { prontuarioId, evolucaoId, data });
    
    const evolucao = mockProntuario.evolucoes.find(e => e.id === evolucaoId);
    if (!evolucao) {
        return {
            success: false,
            message: 'Evolução não encontrada',
        };
    }
    
    return {
        success: true,
        data: {
            ...evolucao,
            dataEvolucao: data.dataEvolucao || evolucao.dataEvolucao,
            descricaoSessao: data.descricaoSessao || evolucao.descricaoSessao,
            atualizadoEm: new Date().toISOString(),
        },
        message: 'Evolução atualizada com sucesso',
    };
}

/**
 * Deletar evolução (MOCK)
 */
export async function deletarEvolucao(
    prontuarioId: string,
    evolucaoId: string
): Promise<{ success: boolean; message: string }> {
    await delay(300);
    debugLog('deletarEvolucao', { prontuarioId, evolucaoId });
    
    const index = mockProntuario.evolucoes.findIndex(e => e.id === evolucaoId);
    if (index === -1) {
        return {
            success: false,
            message: 'Evolução não encontrada',
        };
    }
    
    return {
        success: true,
        message: 'Evolução deletada com sucesso',
    };
}
