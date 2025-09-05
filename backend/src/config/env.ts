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
    FRONTEND_IP_URL: z.string().url().default('http://localhost:5173'),
    FRONTEND_HTTP_URL: z.string().url().default('http://localhost:5173'),
    FRONTEND_HTTPS_URL: z.string().url().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
export const secureCookie = env.NODE_ENV === 'production';
