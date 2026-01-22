import z from 'zod';
import { cpfDigits } from '../../../schemas/utils/cpfDigits.js';
import { dateStringToDate } from '../../../schemas/utils/dateStringToDate.js';
import { uuidParam } from '../../../schemas/utils/uuid.js';

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
            id: z.coerce.number().int().positive(),
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
        motivo_busca_atendimento: z.string().trim().min(1),
        
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
        ).catch([]),

        atendimentos_anteriores: z.string().nullable().default(null),
        observacoes: z.string().nullable().default(null),
    }),

    objetivos_trabalho: z.string().trim().min(1),
    avaliacao_atendimento: z.string().nullable().default(null),
});

export const psychoQuerySchema = z.object({
    q: z.string().optional(),
    status: z
        .enum(['ativo', 'inativo', 'todos'])
        .optional(),
    page: z.coerce.number().int().positive().optional(),
    page_size: z.coerce.number().int().positive().optional(),
});

export type PsychoPayload = z.infer<typeof psychoSchema>;
export type queryType = z.infer<typeof psychoQuerySchema>;