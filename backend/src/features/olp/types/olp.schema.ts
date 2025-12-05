import { z } from 'zod';

export const updateProgramSchema = z
    .object({
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
        goalTitle: z.string().nullable().optional(),
        goalDescription: z.string().nullable().optional(),
        shortTermGoalDescription: z.string().nullable().optional(),
        stimuliApplicationDescription: z.string().nullable().optional(),
        currentPerformanceLevel: z.string().nullable().optional(),
        criteria: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        status: z.enum(['active', 'archived']),
        stimuli: z.array(
            z.object({
                id: z.string().optional(),
                label: z.string().min(1, 'O nome do estímulo é obrigatório.'),
                active: z.boolean(),
                order: z.number(),
            }),
        ),
    })
    .refine((data) => new Date(data.prazoInicio) < new Date(data.prazoFim), {
        message: 'A data de início deve se anterior à data de fim.',
        path: ['prazoInicio'],
    });
