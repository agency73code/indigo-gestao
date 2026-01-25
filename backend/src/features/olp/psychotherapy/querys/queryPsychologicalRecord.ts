import type { Prisma } from "@prisma/client";

export const queryPsychologicalRecord = {
    id: true,
    cliente_id: true,
    terapeuta_id: true,
    clientes: {
        select: {
            id: true,
            nome: true,
            dataNascimento: true,
            genero: true,
            nivel_escolaridade: true,
            dadosEscola: {
                select: {
                    nome: true,
                },
            },
            cuidadores: {
                select: {
                    id: true,
                    nome: true,
                    cpf: true,
                    relacao: true,
                    descricaoRelacao: true,
                    dataNascimento: true,
                    profissao: true,
                },
            },
            anamneses: {
                select: {
                    queixa_diagnostico: {
                        select: {
                            terapias_previas: {
                                select: {
                                    id: true,
                                    profissional: true,
                                    especialidade_abordagem: true,
                                    tempo_intervencao: true,
                                    observacao: true,
                                    ativo: true,
                                },
                            },
                        },
                    },
                },
            },
            arquivos: {
                where: { tipo: 'fotoPerfil' },
                select: {
                    arquivo_id: true,
                },
                take: 1,
            }
        },
    },
    profissao_ocupacao: true,
    observacao_educacional: true,
    observacoes_nucleo_familiar: true,
    encaminhado_por: true,
    motivo_busca_atendimento: true,
    atendimentos_anteriores: true,
    observacao_demanda: true,
    objetivos_trabalho: true,
    avaliacao_atendimento: true,
    status: true,
    criado_em: true,
    atualizado_em: true,
    terapeutas: {
        select: {
            id: true,
            nome: true,
            registro_profissional: {
                select: {
                    numero_conselho: true,
                },
            },
            arquivos: {
                where: { tipo: 'fotoPerfil' },
                select: {
                    arquivo_id: true,
                },
                take: 1,
            },
        },
    },
    evolucoes: {
        select: {
            id: true,
            data_evolucao: true,
            descricao_sessao: true,
            criado_em: true,
            atualizado_em: true,
            anexos: {
                select: {
                    id: true,
                    nome: true,
                    tipo: true,
                    tamanho: true,
                    caminho: true,
                },
            },
        },
    },
} satisfies Prisma.ocp_prontuarioSelect;

export type PsychologicalRecordRow = Prisma.ocp_prontuarioGetPayload<{
    select: typeof queryPsychologicalRecord;
}>;