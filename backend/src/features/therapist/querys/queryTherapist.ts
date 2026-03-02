import { Prisma } from "@prisma/client";

const address = {
    cep: true,
    rua: true,
    numero: true,
    complemento: true,
    bairro: true,
    cidade: true,
    uf: true,
} as const;

export const queryTherapist = {
    nome: true,
    email: true,
    email_indigo: true,
    telefone: true,
    celular: true,
    cpf: true,
    data_nascimento: true,

    endereco: { select : address },

    possui_veiculo: true,
    placa_veiculo: true,
    modelo_veiculo: true,
    banco: true,
    agencia: true,
    conta: true,
    pix_tipo: true,
    chave_pix: true,

    registro_profissional: {
        select: {
            area_atuacao: { select: { nome: true } },
            area_atuacao_id: true,
            cargo: { select: { nome: true } },
            cargo_id: true,
            numero_conselho: true,
        },
    },

    data_entrada: true,
    data_saida: true,
    professor_uni: true,
    disciplina: { select: { nome: true } },

    formacao: {
        select: {
            graduacao: true,
            instituicao_graduacao: true,
            ano_formatura: true,

            pos_graduacao: {
                select: {
                    tipo: true,
                    instituicao: true,
                    curso: true,
                    conclusao: true,
                },
            },

            participacao_congressos: true,
            publicacoes_descricao: true,
        },
    },

    pessoa_juridica: {
        select: {
            cnpj: true,
            razao_social: true,

            endereco: { select: address }
        },
    },

    arquivos: {
        select: {
            arquivo_id: true,
            tipo: true,
            mime_type: true,
            tamanho: true,
            data_upload: true,
        }
    }
} satisfies Prisma.terapeutaSelect;

export type TherapistRow = Prisma.terapeutaGetPayload<{
    select: typeof queryTherapist;
}>;