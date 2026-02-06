import { faturamento_tipo_atendimento } from '@prisma/client';
import { z } from 'zod';
import { billingSchema } from '../billing.schema.js';

export const correctBillingDataSchema = z.object({
    faturamento: billingSchema,
    tipoAtividade: z.enum(faturamento_tipo_atendimento).nullable().optional(),
    comentario: z.string().nullable().default(null),
});

export const existingBillingFilesSchema = z.array(
    z.object({
        id: z.union([z.number(), z.string()]).transform((val) => Number(val)),
        remove: z.boolean().optional().default(false),
    }),
).default([]);

export type CorrectBillingData = z.infer<typeof correctBillingDataSchema>;
export type ExistingBillingFileUpdate = z.infer<typeof existingBillingFilesSchema>[number];