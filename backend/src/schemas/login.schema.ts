import { z } from 'zod';

export const loginSchema = z.object({
    accessInfo: z.string().min(1),
    password: z.string().min(1),
    deviceName: z.string().min(1).max(255).optional(),
});

export type loginSchema = z.infer<typeof loginSchema>;
