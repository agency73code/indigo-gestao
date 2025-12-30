import { z } from 'zod';

export const therapistSelectQuerySchema = z.object({
    search: z.string().optional().default(''),
    role: z.enum(['clinico', 'supervisor']).optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
});

export const therapistListQuerySchema = z.object({
    search: z.string().optional().default(''),
    includeNumeroConselho: z.coerce.boolean().optional().default(false),
    limit: z.coerce.number().int().positive().max(100).optional(),
});

export type TherapistSelectQuery = z.infer<typeof therapistSelectQuerySchema>;
export type TherapistListQuery = z.infer<typeof therapistListQuerySchema>;