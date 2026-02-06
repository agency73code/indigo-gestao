export type SessionAttemptType = 'error' | 'prompted' | 'independent';

export type SessionAttempt = {
    id: string;
    attemptNumber: number;
    stimulusId: string;
    stimulusLabel: string;
    type: SessionAttemptType;
    timestamp: string;
};

export type SessionSummary = {
    overallAccuracy: number;      // % de acertos (independent)
    independenceRate: number;     // % de independência (independent)
    totalAttempts: number;        // total de tentativas da sessão
};

/**
 * ============================================================================
 * DADOS DE FATURAMENTO DA SESSÃO
 * ============================================================================
 * 
 * Importado do módulo centralizado de billing.
 * Estes campos são enviados junto com o payload da sessão para o backend.
 * 
 * BACKEND: Ver /features/programas/core/types/billing.ts para documentação
 * completa dos campos e estrutura de banco de dados.
 * ============================================================================
 */
export type { 
    DadosFaturamentoSessao, 
    ArquivoFaturamento,
    TipoAtendimento,
} from '@/features/programas/core/types/billing';
export { 
    DADOS_FATURAMENTO_INITIAL,
    TIPO_ATENDIMENTO,
    validarDadosFaturamento,
} from '@/features/programas/core/types/billing';

export type SessionState = {
    patientId: string | null;
    programId: string | null;
    attempts: SessionAttempt[];
    summary: SessionSummary;
    notes?: string; // Observações da sessão
    /** 
     * Dados de faturamento da sessão
     * @see DadosFaturamentoSessao em billing.ts
     */
    billing?: import('@/features/programas/core/types/billing').DadosFaturamentoSessao;
};

// Reutilizando tipos existentes
export type { Patient } from '@/features/programas/consultar-programas/types';
export type { ProgramDetail } from '@/features/programas/detalhe-ocp/types';
export type { ProgramListItem } from '@/features/programas/consultar-programas/types';