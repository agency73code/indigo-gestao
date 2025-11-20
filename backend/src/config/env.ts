/*

Valida se todas as variáveis de ambiente necessárias existem
Converte tipos (string → number)
Define valores padrão
Previne erros em runtime por variáveis faltando

*/

import z from 'zod';
import dotenv from 'dotenv';

dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatório'),
    API_URL: z.string(),
    FRONTEND_URL: z.string().url('FRONTEND_URL precisa ser uma URL válida'),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().min(1),
    SMTP_USER: z.string().email().min(1),
    SMTP_PASS: z.string().min(1),
});

export const env = envSchema.parse(process.env);
export const secureCookie = env.NODE_ENV === 'production';
