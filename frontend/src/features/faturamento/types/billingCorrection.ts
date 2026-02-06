/**
 * ============================================================================
 * TIPOS PARA CORREÇÃO DE FATURAMENTO
 * ============================================================================
 * 
 * Tipos específicos para o fluxo de correção e reenvio de lançamentos
 * de faturamento rejeitados.
 * 
 * ============================================================================
 */

import type { DadosFaturamentoSessao } from '@/features/programas/core/types/billing';

/**
 * Status do lançamento de faturamento
 */
export type BillingStatus = 'aprovado' | 'rejeitado' | 'pendente' | 'aguardando';

/**
 * Lançamento de faturamento (vindo da API)
 */
export interface BillingLancamento {
    /** ID do lançamento */
    id: string;
    
    /** ID do cliente */
    clienteId: string;
    
    /** Nome do cliente */
    clienteNome: string;
    
    /** ID do terapeuta */
    terapeutaId: string;
    
    /** Nome do terapeuta */
    terapeutaNome?: string;
    
    /** Tipo de atendimento */
    tipo: 'homecare' | 'consultorio' | 'de Reuniões';
    
    /** Data do lançamento */
    data: string;
    
    /** Horário (formato HH:mm - HH:mm) */
    horario: string;
    
    /** Duração em horas */
    duracao: string;
    
    /** Valor do lançamento */
    valor: number;
    
    /** Status do lançamento */
    status: BillingStatus;
    
    /** Motivo da rejeição (se rejeitado) */
    motivoRejeicao?: string | null;
    
    /** Dados de faturamento completos */
    faturamento?: DadosFaturamentoSessao;
    
    /** ID da sessão relacionada (se houver) */
    sessaoId?: string | null;
}

/**
 * Payload para correção de faturamento
 */
export interface CorrectBillingPayload {
    /** ID do lançamento sendo corrigido */
    lancamentoId: string;
    
    /** Dados de faturamento corrigidos */
    faturamento: DadosFaturamentoSessao;
    
    /** Tipo de atividade (quando diferente de consultorio/homecare) */
    tipoAtividade?: string;
    
    /** Comentário sobre a correção (opcional) */
    comentario?: string;
}

/**
 * Resposta da API ao corrigir faturamento
 */
export interface CorrectBillingResponse {
    /** Sucesso da operação */
    success: boolean;
    
    /** Mensagem de resposta */
    message: string;
    
    /** Lançamento atualizado */
    lancamento?: BillingLancamento;
}

/**
 * Estado do drawer de correção
 */
export interface BillingCorrectionState {
    /** Se o drawer está aberto */
    isOpen: boolean;
    
    /** Lançamento sendo corrigido */
    lancamento: BillingLancamento | null;
    
    /** Se está salvando */
    isSaving: boolean;
    
    /** Erro ao salvar */
    error: string | null;
}
