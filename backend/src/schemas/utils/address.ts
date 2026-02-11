import z from "zod";
import { removeNonAlphanumeric } from "../../utils/removeNonAlphanumeric.js";

export const addressSchema = z.object({
    cep: z.string().min(1, 'Informe o CEP').transform(removeNonAlphanumeric),
    rua: z.string().min(1, 'Informe a rua'),
    numero: z.string().min(1, 'Informe o número'),
    complemento: z.string().nullable().default(null),
    bairro: z.string().min(1, 'Informe o bairro'),
    cidade: z.string().min(1, 'Informe a cidade'),
    estado: z.string().toUpperCase().length(2).min(1, 'Informe a UF com 2 letras'),
});