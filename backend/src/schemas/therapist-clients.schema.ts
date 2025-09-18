import { z } from 'zod';

export const TherapistClientsParamsSchema = z.object({
    therapistId: z.string().min(1),
});

export const TherapistClientsQuerySchema = z.object({
    q: z.string().min(1).optional(),
});

export const TherapistClientItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    birthData: z.date(),
    guardianName: z.string().nullable(),
});

export const TherapistClientsResponseSchema = z.object({
    data: z.array(TherapistClientItemSchema),
});