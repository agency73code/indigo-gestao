import { cpf, cnpj } from 'cpf-cnpj-validator';
import z from 'zod';

export const cpfDigits = z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => cpf.isValid(v), { message: 'CPF inválido' });

export const nullableCpfDigits = z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null || v === '' ? null : v.replace(/\D/g, '')))
    .refine((v) => v === null || cpf.isValid(v), { message: 'CPF inválido' })
    .default(null);

export const cnpjDigits = z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => cnpj.isValid(v), { message: 'CNPJ inválido' });
