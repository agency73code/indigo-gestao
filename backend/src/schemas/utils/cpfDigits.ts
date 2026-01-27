import { cpf, cnpj } from 'cpf-cnpj-validator';
import z from 'zod';

export const cpfDigits = z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => cpf.isValid(v), { message: 'CPF inválido' });

export const cnpjDigits = z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => cnpj.isValid(v), { message: 'CNPJ inválido' });
