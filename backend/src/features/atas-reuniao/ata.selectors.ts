import { Prisma } from "@prisma/client";
import { buildFallbackTherapist } from "./ata.service.js";
import { toDateOnly } from "../../utils/toDateOnly.js";

export const ataSelectBase = Prisma.validator<Prisma.ata_reuniaoSelect>()({
    id: true,
    data: true,
    horario_inicio: true,
    horario_fim: true,
    finalidade: true,
    finalidade_outros: true,
    modalidade: true,
    conteudo: true,
    cliente_id: true,
    terapeuta_id: true,
    status: true,
    criado_em: true,
    atualizado_em: true,
    resumo_ia: true,
    duracao_minutos: true,
    horas_faturadas: true,

    cabecalho_terapeuta_id: true,
    cabecalho_terapeuta_nome: true,
    cabecalho_conselho_numero: true,
    cabecalho_area_atuacao: true,
    cabecalho_cargo: true,

    cliente: {
        select: { id: true, nome: true },
    },

    terapeuta: {
        select: {
            id: true,
            nome: true,
            registro_profissional: {
                select: {
                    numero_conselho: true,
                    area_atuacao: { select: { nome: true } },
                    cargo: { select: { nome: true } },
                },
            },
        },
    },

    participantes: {
        select: {
            id: true,
            tipo: true,
            nome: true,
            descricao: true,
            terapeuta_id: true,
            terapeuta: {
                select: {
                    id: true,
                    nome: true,
                    registro_profissional: {
                        select: {
                            numero_conselho: true,
                            area_atuacao: { select: { nome: true } },
                            cargo: { select: { nome: true } },
                        },
                    },
                },
            },
        },
    },

    links: {
        select: { id: true, titulo: true, url: true },
    },

    anexos: {
        select: {
            id: true,
            nome: true,
            original_nome: true,
            mime_type: true,
            tamanho: true,
            caminho: true,
            external_id: true,
        },
    },
});

export const ataSelectList = Prisma.validator<Prisma.ata_reuniaoSelect>()({
    id: true,
    data: true,
    horario_inicio: true,
    horario_fim: true,
    finalidade: true,
    finalidade_outros: true,
    modalidade: true,
    conteudo: true,
    status: true,
    criado_em: true,
    atualizado_em: true,
    resumo_ia: true,
    duracao_minutos: true,
    horas_faturadas: true,

    cabecalho_terapeuta_id: true,
    cabecalho_terapeuta_nome: true,
    cabecalho_conselho_numero: true,
    cabecalho_area_atuacao: true,
    cabecalho_cargo: true,

    cliente_id: true,
    terapeuta_id: true,

    cliente: { select: { id: true, nome: true } },
    terapeuta: {
        select: {
            id: true,
            nome: true,
            registro_profissional: {
                select: {
                    numero_conselho: true,
                    area_atuacao: { select: { nome: true } },
                    cargo: { select: { nome: true } },
                },
            },
        },
    },

    participantes: {
        select: {
            id: true,
            tipo: true,
            nome: true,
            descricao: true,
            terapeuta_id: true,
            terapeuta: {
                select: {
                    id: true,
                    nome: true,
                    registro_profissional: {
                        select: {
                            numero_conselho: true,
                            area_atuacao: { select: { nome: true } },
                            cargo: { select: { nome: true } },
                        },
                    },
                },
            },
        },
    },

    links: { select: { id: true, titulo: true, url: true } },

    anexos: {
        select: {
            id: true,
            nome: true,
            mime_type: true,
            tamanho: true,
            external_id: true,
        },
    },
});

export type AtaBase = Prisma.ata_reuniaoGetPayload<{
    select: typeof ataSelectBase;
}>;

export type AtaListItem = Prisma.ata_reuniaoGetPayload<{ select: typeof ataSelectList }>;

export function mapAtaBase(ata: AtaBase) {
    return {
        ...ata,
        data: toDateOnly(ata.data),
        anexos: ata.anexos.map((a) => ({ 
            ...a, 
            arquivo_id: a.external_id,
            url: a.caminho,
        })),
    }
}

export function mapAtaListItem(ata: AtaListItem) {
    return {
        ...ata,
        anexos: ata.anexos.map((a) => ({ ...a, arquivo_id: a.external_id })),
        terapeuta: ata.terapeuta ?? buildFallbackTherapist(ata),
    };
}