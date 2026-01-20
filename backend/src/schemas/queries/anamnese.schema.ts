import { z } from 'zod';

export const anamneseListSchema = z.object({
    q: z.string().trim().min(1).max(100).optional(),
    sort: z.string().trim().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const anamneseIdSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/, 'ID deve ser numérico')
        .transform((val) => Number(val)),
});

export const anamneseArquivoIdSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/, 'ID deve ser numérico')
        .transform((val) => Number(val)),
    arquivoId: z
        .string()
        .regex(/^\d+$/, 'ID do arquivo deve ser numérico')
        .transform((val) => Number(val)),
});