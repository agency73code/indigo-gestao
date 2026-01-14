import { authFetch } from '@/lib/http';
import { listarClientes as listarClientesApi, listarTerapeutas as listarTerapeutasApi, buscarClientePorId } from '@/lib/api';
import type { Patient } from '@/features/consultas/types/consultas.types';
import type { Therapist } from '@/features/consultas/types/consultas.types';
import type { Cliente } from '@/features/cadastros/types/cadastros.types';
import type { Anamnese, AnamneseResponse } from '../types/anamnese.types';
import { 
    validateAnamnese, 
    validateAnamneseMinimal,
    getValidationErrorMessages,
    type ValidationResult,
} from './anamnese-cadastro.validation';

// ============================================
// TIPOS AUXILIARES
// ============================================

export type ClienteResumido = Patient;
export type TerapeutaResumido = Therapist;
export type ClienteCompleto = Cliente;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Buscar lista de clientes para o select
export async function listarClientes(): Promise<ClienteResumido[]> {
    const result = await listarClientesApi();
    return result.items;
}

// Buscar cliente completo por ID (com cuidadores)
export async function buscarCliente(id: string): Promise<ClienteCompleto> {
    return buscarClientePorId(id);
}

// Buscar lista de terapeutas para o select
export async function listarTerapeutas(): Promise<TerapeutaResumido[]> {
    const result = await listarTerapeutasApi();
    return result.items;
}

// Buscar terapeuta por ID
export async function buscarTerapeuta(id: string): Promise<TerapeutaResumido> {
    const result = await listarTerapeutasApi();
    const terapeuta = result.items.find((t: TerapeutaResumido) => t.id === id);
    if (!terapeuta) {
        throw new Error(`Terapeuta com ID ${id} não encontrado`);
    }
    return terapeuta;
}

// Calcular idade a partir da data de nascimento
export function calcularIdade(dataNascimento: string): string {
    if (!dataNascimento) return '';
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    
    if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
        anos--;
        meses += 12;
    }
    
    if (hoje.getDate() < nascimento.getDate()) {
        meses--;
        if (meses < 0) meses = 11;
    }
    
    if (anos === 0) {
        return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }
    
    if (meses === 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }
    
    return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}

// Formatar data para exibição (DD/MM/YYYY)
export function formatarData(dataISO: string): string {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
}

/**
 * Endpoint base para anamnese
 */
const ENDPOINT = '/anamneses';

// ============================================
// API SERVICE
// ============================================

async function apiCriarAnamnese(data: Anamnese): Promise<AnamneseResponse> {
    try {
        const fd = new FormData();

        // JSON do payload
        fd.append('payload', JSON.stringify(data));

        const exames = data?.queixaDiagnostico?.examesPrevios ?? [];
        for (const exame of exames) {
            const arquivos = exame?.arquivos ?? [];
            for (const arq of arquivos) {
                if (arq?.id && arq?.file instanceof File && !arq.removed) {
                    fd.append(`files[${arq.id}]`, arq.file, arq.file.name);
                }
            }
        }

        const res = await authFetch(`/api${ENDPOINT}`, {
            method: 'POST',
            body: fd,
        });
        
        const text = await res.text();
        const responseData = text ? JSON.parse(text) : null;
        
        if (!res.ok) {
            // Log detalhado para debug
            console.error('[API] Resposta de erro do servidor:', responseData);
            
            // Se houver erros de validação do Zod, retornar de forma estruturada
            if (responseData?.errors && Array.isArray(responseData.errors)) {
                return {
                    success: false,
                    errors: responseData.errors,
                    message: responseData.message || 'Erro de validação no servidor.',
                };
            }
            
            const msg = responseData?.message ?? responseData?.error ?? `Falha (${res.status})`;
            return {
                success: false,
                message: msg,
            };
        }
        
        return {
            success: true,
            data: responseData as Anamnese,
            message: 'Anamnese criada com sucesso',
        };
    } catch (error) {
        console.error('[API] Erro ao criar anamnese:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Erro desconhecido',
        };
    }
}

// ============================================
// SERVICE PÚBLICO - FUNÇÕES EXPORTADAS
// ============================================

/**
 * Cria uma nova anamnese
 * @param data Dados da anamnese
 * @param skipValidation Pular validação (útil para rascunhos)
 * @returns Resposta com dados ou erros
 */
export async function criarAnamnese(
    data: Anamnese, 
    skipValidation = false
): Promise<AnamneseResponse> {
    // Validar dados antes de enviar
    if (!skipValidation) {
        const validation = validateAnamnese(data);
        if (!validation.success) {
            return {
                success: false,
                errors: validation.errors,
                message: 'Dados inválidos. Verifique os campos obrigatórios.',
            };
        }
    }
    
    return apiCriarAnamnese(data);
}

/**
 * Salva rascunho da anamnese (validação mínima)
 */
export async function salvarRascunhoAnamnese(data: Partial<Anamnese>): Promise<AnamneseResponse> {
    const validation = validateAnamneseMinimal(data);
    if (!validation.success) {
        return {
            success: false,
            errors: validation.errors,
            message: 'Dados mínimos não preenchidos.',
        };
    }
    
    return apiCriarAnamnese(data as Anamnese);
}

/**
 * Valida os dados da anamnese
 * Exporta função de validação para uso externo
 */
export function validarAnamnese(data: unknown): ValidationResult {
    return validateAnamnese(data);
}

/**
 * Valida dados mínimos da anamnese
 */
export function validarAnamneseMinima(data: Partial<Anamnese>): ValidationResult {
    return validateAnamneseMinimal(data);
}

// Re-exportar função auxiliar e tipos úteis
export { getValidationErrorMessages };
export type { ValidationResult };
export type { AnamneseResponse, AnamneseListResponse, ValidationError } from '../types/anamnese.types';
