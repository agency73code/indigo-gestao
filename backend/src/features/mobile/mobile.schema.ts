import { z } from 'zod';

export const bootstrapSessionsQuerySchema = z.object({
    days: z.coerce.number().int().min(1).max(365).default(30),
});

export type BootstrapSessionsQuery = z.infer<typeof bootstrapSessionsQuerySchema>;