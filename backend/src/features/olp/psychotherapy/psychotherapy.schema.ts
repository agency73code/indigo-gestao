import z from 'zod';
import { cpfDigits } from '../../../schemas/utils/cpfDigits.js';
import { dateStringToDate } from '../../../schemas/utils/dateStringToDate.js';
import { uuidParam } from '../../../schemas/utils/uuid.js';
import { idParam } from '../../../schemas/utils/id.js';

export const psychoSchema = z.object({
    cliente_id: uuidParam,

    informacoes_educacionais: z.object({
        nivel_escolaridade: z.string().nullable().default(null),
        instituicao_formacao: z.string().nullable().default(null),
        profissao_ocupacao: z.string().nullable().default(null),
        observacoes: z.string().nullable().default(null),
    }),

    nucleo_familiar: z.array(
        z.object({
            id: idParam,
            nome: z.string().trim().min(1),
            cpf: cpfDigits,
            parentesco: z.string().trim().min(1),
            descricao_relacao: z.string().nullable().default(null),
            data_nascimento: dateStringToDate,
            ocupacao: z.string().nullable().default(null),
            origem_banco: z.boolean(),
        }),
    ).min(1, { message: 'Informe ao menos 1 parente no núcleo familiar' }),
    observacoes_nucleo_familiar: z.string().nullable().default(null),

    avaliacao_demanda: z.object({
        encaminhado_por: z.string().nullable().default(null),
        motivo_busca_atendimento: z.string().trim().min(1, { message: 'Motivo da busca pelo atendimento é obrigatório' }),
        
        terapias_previas: z.array(
            z.object({
                id: z.union([
                    z.coerce.number().int().positive(),
                    z.string().min(1),
                ]),
                profissional: z.string().trim().min(1),
                especialidade_abordagem: z.string().trim().min(1),
                tempo_intervencao: z.string().nullable().default(null),
                observacao: z.string().nullable().default(null),
                ativo: z.boolean(),
            }),
        ).default([]),

        atendimentos_anteriores: z.string().nullable().default(null),
        observacoes: z.string().nullable().default(null),
    }),

    objetivos_trabalho: z.string().trim().min(1, { message: 'Objetivos de trabalho são obrigatórios' }),
    avaliacao_atendimento: z.string().nullable().default(null),
});

export const psychoQuerySchema = z.object({
    q: z.string().optional(),
    status: z
        .enum(['ativo', 'inativo', 'todos'])
        .optional()
        .transform((s) => (s === 'ativo' ? true : s === 'inativo' ? false : undefined)),
    page: z.coerce.number().int().positive().default(1),
    page_size: z.coerce.number().int().positive().max(100).default(10),
});

export const createEvolutionPayloadSchema = z.object({
    data_evolucao: dateStringToDate,
    descricao_sessao: z.string().min(1, { message: 'Descrição da sessão é obrigatório' }),
});

export const psychoUpdateSchema = z.object({
    clienteId: uuidParam,
    genero: z.string().nullable().default(null),
    telefoneResidencial: z.string().nullable().default(null),
    nivelEscolaridade: z.string().nullable().default(null),
    instituicaoFormacao: z.string().nullable().default(null),
    profissaoOcupacao: z.string().nullable().default(null),
    observacoesEducacao: z.string().nullable().default(null),

    nucleoFamiliar: z.array(
        z.object({
            id: idParam,
            nome: z.string().trim().min(1),
            cpf: cpfDigits,
            parentesco: z.string().trim().min(1),
            descricaoRelacao: z.string().nullable().default(null),
            dataNascimento: dateStringToDate,
            ocupacao: z.string().nullable().default(null),
            origemBanco: z.boolean(),
        }),
    ).min(1, { message: 'Informe ao menos 1 parente no núcleo familiar' }),

    observacoesNucleoFamiliar: z.string().nullable().default(null),
    encaminhadoPor: z.string().nullable().default(null),
    motivoBuscaAtendimento: z.string().trim().min(1, { message: 'Motivo da busca pelo atendimento é obrigatório' }),
    atendimentosAnteriores: z.string().nullable().default(null),
    observacoesAvaliacao: z.string().nullable().default(null),

    terapiasPrevias: z.array(
        z.object({
            id: z.union([
                idParam,
                z.string().min(1),
            ]),
            profissional: z.string().trim().min(1),
            especialidadeAbordagem: z.string().trim().min(1),
            tempoIntervencao: z.string().nullable().default(null),
            observacao: z.string().nullable().default(null),
            ativo: z.boolean(),
            origemAnamnese: z.boolean(),
        }),
    ).default([]),

    objetivosTrabalho: z.string().trim().min(1, { message: 'Objetivos de trabalho são obrigatórios' }),
    avaliacaoAtendimento: z.string().nullable().default(null),
    terapeutaId: uuidParam,
});

export type PsychoPayload = z.infer<typeof psychoSchema>;
export type queryType = z.infer<typeof psychoQuerySchema>;
export type CreateEvolutionType = z.infer<typeof createEvolutionPayloadSchema>;
export type PsychoUpdatePayload = z.infer<typeof psychoUpdateSchema>;