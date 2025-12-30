/**
 * Validação de dados para atualização de anamnese
 * Usa Zod para validação tipada
 */
import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDAÇÃO BASE
// Exportados para uso em validações específicas
// ============================================

// Schema para campos Sim/Não
export const simNaoSchema = z.enum(['sim', 'nao']).nullable();

// Schema para campos Sim/Não/Com Ajuda
export const simNaoComAjudaSchema = z.enum(['sim', 'nao', 'com_ajuda']).nullable();

// Schema para Marco de Desenvolvimento
export const marcoDesenvolvimentoSchema = z.object({
    meses: z.string(),
    status: z.enum(['realizado', 'naoRealiza', 'naoSoubeInformar']),
});

// Schema para Gestação e Parto
export const gestacaoPartoSchema = z.object({
    tipoParto: z.string(),
    semanas: z.number().nullable(),
    apgar1min: z.number().nullable(),
    apgar5min: z.number().nullable(),
    intercorrencias: z.string(),
});

// ============================================
// SCHEMAS DE ATUALIZAÇÃO
// ============================================

// Schema para atualização de Identificação (cabeçalho)
const identificacaoUpdateSchema = z.object({
    informante: z.string().min(1, 'Informante é obrigatório'),
    parentesco: z.string().min(1, 'Parentesco é obrigatório'),
    parentescoDescricao: z.string().optional(),
    quemIndicou: z.string().optional(),
});

// Schema para atualização de Queixa e Diagnóstico
const queixaDiagnosticoUpdateSchema = z.object({
    queixaPrincipal: z.string().min(1, 'Queixa principal é obrigatória'),
    diagnosticoPrevio: z.string(),
    suspeitaCondicaoAssociada: z.string(),
    especialidadesConsultadas: z.array(z.object({
        id: z.string(),
        especialidade: z.string(),
        nome: z.string(),
        data: z.string(),
        observacao: z.string().optional(),
        ativo: z.boolean(),
    })),
    medicamentosEmUso: z.array(z.object({
        id: z.string(),
        nome: z.string(),
        dosagem: z.string(),
        dataInicio: z.string(),
        motivo: z.string(),
    })),
    examesPrevios: z.array(z.object({
        id: z.string(),
        nome: z.string(),
        data: z.string(),
        resultado: z.string(),
        arquivos: z.array(z.object({
            id: z.string(),
            nome: z.string(),
            tipo: z.string(),
            tamanho: z.number(),
            url: z.string().optional(),
        })).optional(),
    })),
    terapiasPrevias: z.array(z.object({
        id: z.string(),
        profissional: z.string(),
        especialidadeAbordagem: z.string(),
        tempoIntervencao: z.string(),
        observacao: z.string().optional(),
        ativo: z.boolean(),
    })),
});

// Schema para atualização de Finalização
const finalizacaoUpdateSchema = z.object({
    expectativasFamilia: z.string(),
    informacoesAdicionais: z.string(),
    observacoesFinais: z.string(),
});

// Schema para atualização parcial de Anamnese
export const anamneseUpdateSchema = z.object({
    cabecalho: z.object({
        informante: z.string().optional(),
        parentesco: z.string().optional(),
        parentescoDescricao: z.string().optional(),
        quemIndicou: z.string().optional(),
    }).optional(),
    queixaDiagnostico: queixaDiagnosticoUpdateSchema.partial().optional(),
    finalizacao: finalizacaoUpdateSchema.partial().optional(),
    // Adicionar outros campos conforme necessário
}).partial();

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

export interface ValidationResult {
    success: boolean;
    errors: Array<{ field: string; message: string }>;
}

/**
 * Valida dados de atualização da anamnese
 */
export function validateAnamneseUpdate(data: unknown): ValidationResult {
    const result = anamneseUpdateSchema.safeParse(data);
    
    if (result.success) {
        return { success: true, errors: [] };
    }

    const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
    }));

    return { success: false, errors };
}

/**
 * Valida campos obrigatórios de identificação
 */
export function validateIdentificacao(data: unknown): ValidationResult {
    const result = identificacaoUpdateSchema.safeParse(data);
    
    if (result.success) {
        return { success: true, errors: [] };
    }

    const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
    }));

    return { success: false, errors };
}

/**
 * Sanitiza string removendo caracteres potencialmente perigosos
 */
export function sanitizeString(value: string): string {
    if (!value) return '';
    return value
        .trim()
        .replace(/<[^>]*>/g, '') // Remove tags HTML
        .replace(/javascript:/gi, '') // Remove javascript:
        .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Sanitiza objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item => 
                typeof item === 'object' && item !== null 
                    ? sanitizeObject(item as Record<string, unknown>)
                    : typeof item === 'string' 
                        ? sanitizeString(item)
                        : item
            );
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value as Record<string, unknown>);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized as T;
}

/**
 * Prepara dados para envio ao backend
 * - Valida os dados
 * - Sanitiza strings
 * - Remove campos undefined
 */
export function prepareDataForBackend<T extends Record<string, unknown>>(
    data: T
): { valid: boolean; data: T | null; errors: Array<{ field: string; message: string }> } {
    // Validar
    const validation = validateAnamneseUpdate(data);
    if (!validation.success) {
        return { valid: false, data: null, errors: validation.errors };
    }

    // Sanitizar
    const sanitized = sanitizeObject(data);

    // Remover campos undefined
    const cleaned = JSON.parse(JSON.stringify(sanitized));

    return { valid: true, data: cleaned, errors: [] };
}
