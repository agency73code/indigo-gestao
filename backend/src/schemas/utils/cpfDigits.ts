import { cpf } from 'cpf-cnpj-validator';
import z from 'zod';

export const cpfDigits = z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => cpf.isValid(v), { message: 'CPF inválido' });