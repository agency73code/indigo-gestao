import { z } from 'zod';

export const phoneSchema = (label = 'Telefone') =>
    z
        .string()
        .transform((value) => value.replace(/\D/g, ''))
        .refine(
            (value) => value.length === 10 || value.length === 11,
            { message: `Informe um ${label} válido` },
        );

export const phoneSchemaNullable = (label = 'Telefone') =>
    z
        .union([z.string(), z.null()])
        .transform((value) => {
            if (value === null) return null;
            return value.replace(/\D/g, '');
        })
        .refine(
            (value) =>
                value === null ||
                value.length === 10 ||
                value.length === 11,
                { message: `Informe o ${label} válido` },
        )
        .default(null);