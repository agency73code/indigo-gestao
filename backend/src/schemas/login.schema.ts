import { z } from 'zod';

export const loginSchema = z.object({
    accessInfo: z
        .string()
        .min(1, "Informações de acesso são necessárias")
        .transform((val) => {
            const normalized = val.trim().toLowerCase().replace(/\s+/g, "");
            const isEmail = normalized.includes("@");
            const cpfOnlyDigits = normalized.replace(/\D/g, "");

            return {
                raw: val,
                isEmail,
                cpf: cpfOnlyDigits,
            };
        }),
    password: z.string().min(8, "Senha deve ter no minimo 8 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;