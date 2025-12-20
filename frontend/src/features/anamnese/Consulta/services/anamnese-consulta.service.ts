import { authFetch } from '@/lib/http';
import type { AnamneseDetalhe } from '../types/anamnese-consulta.types';
import { getMockAnamneseById } from '../mocks/anamnese-consulta.mock';

// Flag para usar dados mock (desabilitar quando API estiver pronta)
const USE_MOCK = true;

/**
 * Busca dados completos de uma anamnese por ID
 * 
 * @param id - ID da anamnese
 * @returns Dados completos da anamnese ou null se não encontrada
 */
export async function getAnamneseById(id: string): Promise<AnamneseDetalhe | null> {
    // ========== MOCK: Usar dados locais para desenvolvimento ==========
    if (USE_MOCK) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        return getMockAnamneseById(id);
    }
    // ===================================================================

    const res = await authFetch(`/api/anamneses/${id}`, { method: 'GET' });
    const text = await res.text();
    const response = text ? JSON.parse(text) : null;

    if (!res.ok) {
        if (res.status === 404) {
            return null;
        }
        const msg = response?.message ?? response?.error ?? `Falha ao buscar anamnese (${res.status})`;
        throw new Error(msg);
    }

    const data = response?.normalized ?? response;
    return data as AnamneseDetalhe;
}

/**
 * Atualiza dados de uma anamnese
 * 
 * @param id - ID da anamnese
 * @param data - Dados parciais para atualização
 * @returns Anamnese atualizada
 */
export async function updateAnamnese(id: string, data: Partial<AnamneseDetalhe>): Promise<AnamneseDetalhe> {
    // ========== MOCK: Simular atualização ==========
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const existing = getMockAnamneseById(id);
        if (!existing) {
            throw new Error('Anamnese não encontrada');
        }
        return { ...existing, ...data, updatedAt: new Date().toISOString() };
    }
    // ================================================

    const res = await authFetch(`/api/anamneses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const text = await res.text();
    const response = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const msg = response?.message ?? response?.error ?? `Falha ao atualizar anamnese (${res.status})`;
        throw new Error(msg);
    }

    return response?.normalized ?? response;
}

/**
 * Exporta anamnese em PDF
 * 
 * @param id - ID da anamnese
 * @returns Blob do PDF
 */
export async function exportAnamnese(id: string): Promise<Blob> {
    // ========== MOCK: Simular exportação ==========
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Retornar um blob vazio simulando PDF
        return new Blob(['PDF mock content'], { type: 'application/pdf' });
    }
    // ================================================

    const res = await authFetch(`/api/anamneses/${id}/export`, { method: 'GET' });

    if (!res.ok) {
        const text = await res.text();
        const response = text ? JSON.parse(text) : null;
        const msg = response?.message ?? response?.error ?? `Falha ao exportar anamnese (${res.status})`;
        throw new Error(msg);
    }

    return res.blob();
}
