import { authFetch } from '@/lib/http';
import type { AnamneseDetalhe } from '../types/anamnese-consulta.types';

// ============================================
// FUNÇÕES DO SERVICE
// ============================================

/**
 * Busca dados completos de uma anamnese por ID
 * 
 * @param id - ID da anamnese
 * @returns Dados completos da anamnese ou null se não encontrada
 * @throws Error se ID inválido ou falha na API
 */
export async function getAnamneseById(id: string): Promise<AnamneseDetalhe | null> {
    // Validar ID
    if (!id || typeof id !== 'string') {
        throw new Error('ID da anamnese é obrigatório');
    }

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
 * @throws Error se ID inválido, dados inválidos ou falha na API
 */
export async function updateAnamnese(id: string, data: Partial<AnamneseDetalhe>): Promise<AnamneseDetalhe> {
    // Validar ID
    if (!id || typeof id !== 'string') {
        throw new Error('ID da anamnese é obrigatório');
    }

    const fd = new FormData();
    fd.append('payload', JSON.stringify(data));

    const exames = data?.queixaDiagnostico?.examesPrevios ?? [];

    for (const exame of exames) {
        const arquivos = exame?.arquivos ?? [];
        for (const arq of arquivos) {
            if (arq?.id && arq?.file instanceof File && arq.removed === false) {
                fd.append(`files[${arq.id}]`, arq.file, arq.file.name);
            }
        }
    }

    const res = await authFetch(`/api/anamneses/${id}`, {
        method: 'PATCH',
        body: fd,
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
    const res = await authFetch(`/api/anamneses/${id}/export`, { method: 'GET' });

    if (!res.ok) {
        const text = await res.text();
        const response = text ? JSON.parse(text) : null;
        const msg = response?.message ?? response?.error ?? `Falha ao exportar anamnese (${res.status})`;
        throw new Error(msg);
    }

    return res.blob();
}
