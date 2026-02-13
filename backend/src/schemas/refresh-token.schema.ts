import { z } from 'zod';

export const refreshTokenBodySchema = z.object({
    refreshToken: z.string().min(1),
    deviceName: z.string().min(1).max(255).optional(),
});

export const logoutBodySchema = z.object({
    refreshToken: z.string().min(1).optional(),
});