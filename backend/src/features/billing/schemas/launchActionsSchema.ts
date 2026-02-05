import { z } from 'zod'; 

export const rejectLaunchSchema = z.object({
    motivo: z.string().nullable().default(null),
}) ;

export const approveLaunchSchema = z.object({
    valorAjudaCusto: z
        .coerce
        .number()
        .positive()
        .optional()
        .refine(v => v !== null, { message: 'valor inválido' }),
});

export type rejectLaunchPayload = z.infer<typeof rejectLaunchSchema>; 
export type approveLaunchPayload = z.infer<typeof approveLaunchSchema>; 