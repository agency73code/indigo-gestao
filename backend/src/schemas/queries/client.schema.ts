import { z } from 'zod';

export const clientOptionsSchema = z.object({
    search: z.string().trim().max(100).optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
});

export const clientListSchema = z.object({
    search: z.string().trim().max(100).optional(),
    includeResponsavel: z.coerce.boolean().optional(),
    limit: z.coerce.number().int().positive().max(200).optional(),
});