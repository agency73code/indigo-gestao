import { z } from "zod";

export const updateProgramSchema = z.object({
    id: z.number(),
    name: z.string().min(1, 'O nome do programa é obrigatório.'),
    prazoInicio: z
        .string()
        .min(1, 'A data de início é obrigatória.')
        .refine((v) => !isNaN(Date.parse(v)), 'A data início é inválida.'),
    prazoFim: z
        .string()
        .min(1, 'A data de fim é obrigatória.')
        .refine((v) => !isNaN(Date.parse(v)), 'A data de fim é inválida.'),
    goalTitle: z.string().nullable(),
    goalDescription: z.string().nullable(),
    shortTermGoalDescription: z.string().nullable(),
    stimuliApplicationDescription: z.string().nullable(),
    criteria: z.string().nullable(),
    notes: z.string().nullable(),
    status: z.enum(['active', 'archived']),
    stimuli: z
        .array(
            z.object({
                id: z.string(),
                label: z.string().min(1, 'O nome do estímulo é obrigatório.'),
                active: z.boolean(),
                order: z.number(),
            })
        )
}).refine(
    (data) => new Date(data.prazoInicio) < new Date(data.prazoFim),
    {
        message: 'A data de início deve se anterior à data de fim.',
        path: ['prazoInicio'],
    }
);