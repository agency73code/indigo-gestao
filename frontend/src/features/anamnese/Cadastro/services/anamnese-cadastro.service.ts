/**
 * Service para Cadastro de Anamnese
 * Preparado para integração com backend real
 * 
 * Para conectar ao backend real:
 * 1. Alterar USE_MOCK para false
 * 2. Verificar se o endpoint está correto
 * 3. Deletar pasta mocks/ se não for mais necessária
 */

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

// ============================================
// CONFIGURAÇÃO
// ============================================

/**
 * Flag para usar mock ou API real
 * Alterar para false quando backend estiver pronto
 */
const USE_MOCK = true;

/**
 * Endpoint base para anamnese
 */
const ENDPOINT = '/anamneses';



// ============================================
// TRANSFORMAÇÃO DE DADOS
// ============================================

/**
 * Transforma dados do frontend para o formato esperado pelo backend
 * Aqui fazemos qualquer conversão necessária antes de enviar
 */
export function transformToBackendFormat(data: Anamnese): Record<string, unknown> {
    return {
        // Identificação
        clienteId: data.cabecalho.clienteId,
        profissionalId: data.cabecalho.profissionalId,
        dataEntrevista: data.cabecalho.dataEntrevista,
        informante: data.cabecalho.informante,
        parentesco: data.cabecalho.parentesco,
        parentescoDescricao: data.cabecalho.parentescoDescricao || null,
        quemIndicou: data.cabecalho.quemIndicou || null,
        
        // Queixa e Diagnóstico
        queixaPrincipal: data.queixaDiagnostico.queixaPrincipal,
        diagnosticoPrevio: data.queixaDiagnostico.diagnosticoPrevio || null,
        suspeitaCondicaoAssociada: data.queixaDiagnostico.suspeitaCondicaoAssociada || null,
        especialidadesConsultadas: data.queixaDiagnostico.especialidadesConsultadas.map(esp => ({
            especialidade: esp.especialidade,
            nome: esp.nome,
            data: esp.data || null,
            observacao: esp.observacao || null,
            ativo: esp.ativo,
        })),
        medicamentosEmUso: data.queixaDiagnostico.medicamentosEmUso.map(med => ({
            nome: med.nome,
            dosagem: med.dosagem || null,
            dataInicio: med.dataInicio || null,
            motivo: med.motivo || null,
        })),
        examesPrevios: data.queixaDiagnostico.examesPrevios.map(exame => ({
            nome: exame.nome,
            data: exame.data || null,
            resultado: exame.resultado || null,
            // Arquivos são enviados separadamente via upload
        })),
        terapiasPrevias: data.queixaDiagnostico.terapiasPrevias.map(ter => ({
            profissional: ter.profissional,
            especialidadeAbordagem: ter.especialidadeAbordagem || null,
            tempoIntervencao: ter.tempoIntervencao || null,
            observacao: ter.observacao || null,
            ativo: ter.ativo,
        })),
        
        // Contexto Familiar
        historicosFamiliares: (data.contextoFamiliarRotina.historicosFamiliares || []).map(hist => ({
            condicaoDiagnostico: hist.condicaoDiagnostico,
            parentesco: hist.parentesco,
            observacao: hist.observacao || null,
        })),
        atividadesRotina: (data.contextoFamiliarRotina.atividadesRotina || []).map(rot => ({
            atividade: rot.atividade,
            horario: rot.horario,
            responsavel: rot.responsavel || null,
            frequencia: rot.frequencia || null,
            observacao: rot.observacao || null,
        })),
        
        // Desenvolvimento Inicial
        desenvolvimentoInicial: {
            gestacaoParto: data.desenvolvimentoInicial.gestacaoParto,
            neuropsicomotor: data.desenvolvimentoInicial.neuropsicomotor,
            falaLinguagem: data.desenvolvimentoInicial.falaLinguagem,
        },
        
        // Atividades de Vida Diária
        atividadesVidaDiaria: {
            desfralde: data.atividadesVidaDiaria.desfralde,
            sono: data.atividadesVidaDiaria.sono,
            habitosHigiene: data.atividadesVidaDiaria.habitosHigiene,
            alimentacao: data.atividadesVidaDiaria.alimentacao,
        },
        
        // Social e Acadêmico
        socialAcademico: {
            desenvolvimentoSocial: data.socialAcademico.desenvolvimentoSocial,
            desenvolvimentoAcademico: data.socialAcademico.desenvolvimentoAcademico,
        },
        
        // Comportamento
        comportamento: {
            estereotipiasRituais: data.comportamento.estereotipiasRituais,
            problemasComportamento: data.comportamento.problemasComportamento,
        },
        
        // Finalização
        finalizacao: {
            outrasInformacoesRelevantes: data.finalizacao.outrasInformacoesRelevantes || null,
            observacoesImpressoesTerapeuta: data.finalizacao.observacoesImpressoesTerapeuta || null,
            expectativasFamilia: data.finalizacao.expectativasFamilia || null,
        },
    };
}

/**
 * Transforma dados do backend para o formato do frontend
 */
export function transformFromBackendFormat(backendData: Record<string, unknown>): Anamnese {
    // TODO: Implementar transformação inversa quando backend definir formato
    return backendData as unknown as Anamnese;
}

// ============================================
// MOCK SERVICE
// ============================================

async function mockCriarAnamnese(data: Anamnese): Promise<AnamneseResponse> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('[MOCK] Criando anamnese:', data);
    
    return {
        success: true,
        data: {
            ...data,
            id: `anamnese-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        message: 'Anamnese criada com sucesso',
    };
}

async function mockAtualizarAnamnese(id: string, data: Partial<Anamnese>): Promise<AnamneseResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('[MOCK] Atualizando anamnese:', id, data);
    
    return {
        success: true,
        data: {
            ...(data as Anamnese),
            id,
            updatedAt: new Date().toISOString(),
        },
        message: 'Anamnese atualizada com sucesso',
    };
}

async function mockBuscarAnamnese(id: string): Promise<AnamneseResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('[MOCK] Buscando anamnese:', id);
    
    return {
        success: false,
        message: 'Anamnese não encontrada (mock)',
    };
}

async function mockExcluirAnamnese(id: string): Promise<AnamneseResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('[MOCK] Excluindo anamnese:', id);
    
    return {
        success: true,
        message: 'Anamnese excluída com sucesso',
    };
}

// ============================================
// API SERVICE
// ============================================

async function apiCriarAnamnese(data: Anamnese): Promise<AnamneseResponse> {
    try {
        const backendData = transformToBackendFormat(data);
        const res = await authFetch(`/api${ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendData),
        });
        
        const text = await res.text();
        const responseData = text ? JSON.parse(text) : null;
        
        if (!res.ok) {
            const msg = responseData?.message ?? responseData?.error ?? `Falha (${res.status})`;
            throw new Error(msg);
        }
        
        return {
            success: true,
            data: responseData as Anamnese,
            message: 'Anamnese criada com sucesso',
        };
    } catch (error) {
        console.error('[API] Erro ao criar anamnese:', error);
        throw error;
    }
}

async function apiAtualizarAnamnese(id: string, data: Partial<Anamnese>): Promise<AnamneseResponse> {
    try {
        const res = await authFetch(`/api${ENDPOINT}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        
        const text = await res.text();
        const responseData = text ? JSON.parse(text) : null;
        
        if (!res.ok) {
            const msg = responseData?.message ?? responseData?.error ?? `Falha (${res.status})`;
            throw new Error(msg);
        }
        
        return {
            success: true,
            data: responseData as Anamnese,
            message: 'Anamnese atualizada com sucesso',
        };
    } catch (error) {
        console.error('[API] Erro ao atualizar anamnese:', error);
        throw error;
    }
}

async function apiBuscarAnamnese(id: string): Promise<AnamneseResponse> {
    try {
        const res = await authFetch(`/api${ENDPOINT}/${id}`, { method: 'GET' });
        
        const text = await res.text();
        const responseData = text ? JSON.parse(text) : null;
        
        if (!res.ok) {
            const msg = responseData?.message ?? responseData?.error ?? `Falha (${res.status})`;
            throw new Error(msg);
        }
        
        return {
            success: true,
            data: responseData as Anamnese,
        };
    } catch (error) {
        console.error('[API] Erro ao buscar anamnese:', error);
        throw error;
    }
}

async function apiExcluirAnamnese(id: string): Promise<AnamneseResponse> {
    try {
        const res = await authFetch(`/api${ENDPOINT}/${id}`, { method: 'DELETE' });
        
        if (!res.ok) {
            const text = await res.text();
            const responseData = text ? JSON.parse(text) : null;
            const msg = responseData?.message ?? responseData?.error ?? `Falha (${res.status})`;
            throw new Error(msg);
        }
        
        return {
            success: true,
            message: 'Anamnese excluída com sucesso',
        };
    } catch (error) {
        console.error('[API] Erro ao excluir anamnese:', error);
        throw error;
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
    
    // Usar mock ou API real
    if (USE_MOCK) {
        return mockCriarAnamnese(data);
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
    
    if (USE_MOCK) {
        return mockCriarAnamnese(data as Anamnese);
    }
    
    return apiCriarAnamnese(data as Anamnese);
}

/**
 * Atualiza uma anamnese existente
 */
export async function atualizarAnamnese(
    id: string, 
    data: Partial<Anamnese>
): Promise<AnamneseResponse> {
    if (USE_MOCK) {
        return mockAtualizarAnamnese(id, data);
    }
    
    return apiAtualizarAnamnese(id, data);
}

/**
 * Busca uma anamnese por ID
 */
export async function buscarAnamnese(id: string): Promise<AnamneseResponse> {
    if (USE_MOCK) {
        return mockBuscarAnamnese(id);
    }
    
    return apiBuscarAnamnese(id);
}

/**
 * Exclui uma anamnese
 */
export async function excluirAnamnese(id: string): Promise<AnamneseResponse> {
    if (USE_MOCK) {
        return mockExcluirAnamnese(id);
    }
    
    return apiExcluirAnamnese(id);
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
