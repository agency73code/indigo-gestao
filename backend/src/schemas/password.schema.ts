import { z } from 'zod';

export const passwordSchema = z.object({
    password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter: 1 minúscula, 1 maiúscula, 1 número e 1 caractere especial'
    ),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword']
});

export const tokenParamSchema = z.object({
    token: z.string().min(1, 'Token é obrigatório')
});
