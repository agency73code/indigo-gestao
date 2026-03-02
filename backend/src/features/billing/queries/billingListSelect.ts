import { Prisma } from "@prisma/client";

export const billingListSelect = Prisma.validator<Prisma.faturamentoSelect>()({
    id: true,
    ata_id: true,
    ata: {
        select: {
            finalidade: true,
            cabecalho_area_atuacao: true,
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
            registro_profissional: {
                select: {
                    numero_conselho: true,
                    area_atuacao: {
                        select: {
                            nome: true,
                        },
                    },
                },
            },
        },
    },
    cliente_id: true,
    cliente: {
        select: {
            nome: true,
            dataNascimento: true,
            arquivos: {
                where: { tipo: 'fotoPerfil' },
                select: {
                    arquivo_id: true,
                },
            },
            terapeuta: {
                select: {
                    terapeuta_id: true,
                    valor_cliente_sessao: true,
                    valor_sessao_consultorio: true,
                    valor_sessao_homecare: true,
                    valor_hora_desenvolvimento_materiais: true,
                    valor_hora_supervisao_recebida: true,
                    valor_hora_supervisao_dada: true,
                    valor_hora_reuniao: true,
                },
            },
        },
    },

    // Data e horários
    inicio_em: true,
    fim_em: true,

    arquivos: {
        select: {
            id: true,
            nome: true,
            caminho: true,
            mime_type: true,
            tamanho: true,
        }
    },
    
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