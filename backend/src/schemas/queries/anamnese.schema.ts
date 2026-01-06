import { z } from 'zod';

export const anamneseListSchema = z.object({
    q: z.string().trim().min(1).max(100).optional(),
    sort: z.string().trim().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
});