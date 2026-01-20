// ============================================
// ENUMS / CONSTANTES
// ============================================

import type { ata_finalidade_reuniao } from "@prisma/client";
import type { createAtaPayload, updateAtaPayload } from "./ata.schema.js";
import type { ParsedAtaAnexo } from "./utils/ata.anexos.js";

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

export type CreateAtaServiceInput = {
    payload: createAtaPayload;
    anexos: ParsedAtaAnexo[];
};

export type UpdateAtaServiceInput = {
    id: number;
    userId: string;
    payload: updateAtaPayload;
    anexos: ParsedAtaAnexo[];
}

export interface AtaListFilters {
    q?: string | undefined;
    finalidade?: ata_finalidade_reuniao | undefined;
    dataInicio?: string | undefined;
    dataFim?: string | undefined;
    clienteId?: string | undefined;
    orderBy?: 'recent' | 'oldest' | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}

export interface AtaListResult {
    items: Array<Record<string, unknown>>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

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
