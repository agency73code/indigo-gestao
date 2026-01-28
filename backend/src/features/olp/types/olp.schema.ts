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

const areaEnum = z.enum([
    "fonoaudiologia",
    "terapia-ocupacional",
    "fisioterapia",
    "psicomotricidade",
    "educacao-fisica",
    "musicoterapia",
]);

const performanceTypeSchema = z
    .enum(['desempenhou', 'desempenhou-com-ajuda', 'nao-desempenhou'])
    .transform((val) => {
        const map = {
            "desempenhou": "independent",
            "desempenhou-com-ajuda": "prompted",
            "nao-desempenhou": "error",
        } as const;

        return map[val];
    });

const notesSchema = z.string().trim().nullable().default(null);
const nonEmptyString = z.string().trim().min(1);
const attemptNumber = z.number().int().min(1);

const speechAttemptSchema = z.object({
    stimulusId: nonEmptyString,
    attemptNumber,
    type: z.enum(['error', 'prompted', 'independent']),
});

const toAttemptSchema = z.object({
    attemptNumber,
    activityId: nonEmptyString,
    type: performanceTypeSchema,
    timestamp: nonEmptyString,
    durationMinutes: z.number().int().min(0).nullable().default(null),
});

const physioAttemptSchema = z.object({
    attemptNumber,
    activityId: nonEmptyString,
    type: performanceTypeSchema,
    timestamp: nonEmptyString,
    durationMinutes: z.number().int().min(0).nullable().default(null),

    usedLoad: z.boolean().nullable().default(null),
    loadValue: z.string().trim().nullable().default(null),
    hadDiscomfort: z.boolean().nullable().default(null),
    discomfortDescription: z.string().trim().nullable().default(null),
    hadCompensation: z.boolean().nullable().default(null),
    compensationDescription: z.string().trim().nullable().default(null),
}).superRefine((data, ctx) => {
    if (data.usedLoad === true && !data.loadValue) {
        ctx.addIssue({
            code: 'custom',
            message: "Informe o valor da carga utilizada",
            path: ["loadValue"],
        });
    }
    if (data.hadDiscomfort === true && !data.discomfortDescription) {
        ctx.addIssue({
            code: 'custom',
            message: "Descreva o desconforto apresentado",
            path: ["discomfortDescription"],
        });
    }
    if (data.hadCompensation === true && !data.compensationDescription) {
        ctx.addIssue({
            code: 'custom',
            message: "Descreva a compensação observada",
            path: ["compensationDescription"],
        });
    }
});;

const musicAttemptSchema = z.object({
    attemptNumber,
    activityId: nonEmptyString,
    type: performanceTypeSchema,
    participacao: z.number().int().min(0).max(5),
    suporte: z.number().int().min(0).max(5),
});

const baseSchema = z.object({
    programId: z.number().int().positive(),
    patientId: nonEmptyString,
    therapistId: nonEmptyString,
    notes: notesSchema,
});

export const createAreaSessionDataSchema = z.discriminatedUnion("area", [
    baseSchema.extend({
        area: z.literal(areaEnum.enum.fonoaudiologia),
        attempts: z.array(speechAttemptSchema).min(1),
    }),

    baseSchema.extend({
        area: z.literal(areaEnum.enum['terapia-ocupacional']),
        attempts: z.array(toAttemptSchema).min(1),
    }),

    baseSchema.extend({
        area: z.enum([
            areaEnum.enum.fisioterapia,
            areaEnum.enum.psicomotricidade,
            areaEnum.enum['educacao-fisica'],
        ]),
        attempts: z.array(physioAttemptSchema).min(1),
    }),

    baseSchema.extend({
        area: z.literal(areaEnum.enum.musicoterapia),
        attempts: z.array(musicAttemptSchema).min(1),
    }),
]);

export type CreateAreaSessionData = z.infer<typeof createAreaSessionDataSchema>;