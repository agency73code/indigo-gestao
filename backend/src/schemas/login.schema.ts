import { z } from 'zod';

export const loginSchema = z.object({
    accessInfo: z.string().min(1),
    password: z.string().min(1),
});

export type loginSchema = z.infer<typeof loginSchema>;
