import { z } from 'zod'; 

export const rejectLaunchSchema = z.object({
    motivo: z.string().nullable().default(null),
}) ;

export const approveLaunchSchema = z.object({
    valorAjudaCusto: z
        .coerce
        .number()
        .nonnegative() // Permite 0 ou valores positivos
        .optional()
        .nullable(),
});

export type rejectLaunchPayload = z.infer<typeof rejectLaunchSchema>; 
export type approveLaunchPayload = z.infer<typeof approveLaunchSchema>; 