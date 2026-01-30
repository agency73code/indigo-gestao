import { Prisma } from "@prisma/client";

export const billingListSelect = Prisma.validator<Prisma.faturamentoSelect>()({
    id: true,
    ata_id: true,
    ata: {
        select: {
            finalidade: true,
        },
    },
    sessao_id: true,
    sessao: {
        select: {
            ocp: {
                select: {
                    area: true,
                    nome_programa: true,
                },
            },
        },
    },
    evolucao_id: true,

    // Relacionamentos
    terapeuta_id: true,
    terapeuta: {
        select: {
            nome: true,
            arquivos: {
                where: { tipo: 'fotoPerfil' },
                select: {
                    arquivo_id: true,
                },
            },
        },
    },
    cliente_id: true,
    cliente: {
        select: {
            nome: true,
            arquivos: {
                where: { tipo: 'fotoPerfil' },
                select: {
                    arquivo_id: true,
                },
            },
        },
    },

    // Data e horários
    inicio_em: true,
    fim_em: true,

    tipo_atendimento: true,
    status: true,
    ajuda_custo: true,
    observacao_faturamento: true,
    valor_ajuda_custo: true,
    motivo_rejeicao: true,
    criado_em: true,
});

export type BillingListItem = Prisma.faturamentoGetPayload<{
    select: typeof billingListSelect;
}>;