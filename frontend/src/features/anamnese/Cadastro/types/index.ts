/**
 * Tipos para Cadastro de Anamnese
 * 
 * Re-exporta tipos base e define tipos específicos para o formulário
 */

// Re-exporta todos os tipos base
export * from '../../types';

// ============================================
// TIPOS ESPECÍFICOS PARA FORMULÁRIO
// ============================================

import type { Anamnese } from '../../types';

export interface AnamneseFormData extends Partial<Anamnese> {}

// Tipo para arquivo em upload (com File object)
export interface ArquivoUpload {
    id: string;
    nome: string;
    tipo: string;
    tamanho: number;
    file: File;
    url?: string;
    caminho?: string;
    removed?: boolean;
}
