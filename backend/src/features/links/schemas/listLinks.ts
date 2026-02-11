import { z } from 'zod';

export const listLinksSchema = z.object({
    q: z.string().trim().optional(),
    status: z.enum(['active', 'ended', 'archived', 'all']),
    viewBy: z.enum(['patient', 'therapist']),
    orderBy: z.enum(['recent', 'alpha']).default('recent'),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().default(10),
})

export type listLinksPayload = z.infer<typeof listLinksSchema>;