/**
 * Tipos para Atas de Reunião
 * @module features/atas-reuniao
 */

// ============================================
// ENUMS / CONSTANTES
// ============================================

export const FINALIDADE_REUNIAO = {
    ORIENTACAO_PARENTAL: 'orientacao_parental',
    REUNIAO_EQUIPE: 'reuniao_equipe',
    REUNIAO_ESCOLA: 'reuniao_escola',
    SUPERVISAO_TERAPEUTA: 'supervisao_terapeuta',
    PLANEJAMENTO_TERAPEUTICO: 'planejamento_terapeutico',
    DEVOLUTIVA: 'devolutiva',
    OUTROS: 'outros',
} as const;

export const MODALIDADE_REUNIAO = {
    PRESENCIAL: 'presencial',
    ONLINE: 'online',
} as const;

export type FinalidadeReuniao = typeof FINALIDADE_REUNIAO[keyof typeof FINALIDADE_REUNIAO];
export type ModalidadeReuniao = typeof MODALIDADE_REUNIAO[keyof typeof MODALIDADE_REUNIAO];

// ============================================
// TIPOS - GERAÇÃO DE RESUMO IA
// ============================================

export interface GerarResumoRequest {
    conteudo: string;
    finalidade: FinalidadeReuniao;
    data: string;
    participantes?: string[];
    terapeuta: string;
    profissao: string;
    paciente?: string;
}

export interface GerarResumoResponse {
    summary: string;
}
