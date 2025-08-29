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
    PORT: z.string().default('3000').transform(Number),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
