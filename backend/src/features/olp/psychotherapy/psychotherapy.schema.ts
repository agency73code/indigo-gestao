import z from 'zod';

export const psychoSchema = z.object({
    cliente_id: z.uuid({ message: 'cliente_id deve ser um UUID válido' }),

    informacoes_educacionais: z.object({
        nivel_escolaridade: z.string().nullable().default(null),
        instituicao_formacao: z.string().trim().min(1),
        profissao_ocupacao: z.string().nullable().default(null),
        observacoes: z.string().nullable().default(null),
    }),

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

export type PsychoPayload = z.infer<typeof psychoSchema>;