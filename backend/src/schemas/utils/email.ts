import z from "zod";

export const makeEmailSchema = (messages?: {
    required?: string;
    invalid?: string;
}) => 
    z
    .string()
    .min(1, { message: messages?.required ?? 'E-mail é obrigatório' })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
        message: 'E-mail inválido',
    });