import { z } from "zod";
import { isValidCPF } from "@/common/utils/mask";

export const personalSchema = z.object({
  nomeCompleto: z
    .string()
    .min(3, "Informe seu nome completo")
    .transform((v) => v.trim())
    .refine((v) => v.split(" ").length >= 2, "Digite nome e sobrenome"),
  cpf: z
    .string()
    .min(14, "CPF incompleto")
    .refine(isValidCPF, "CPF inválido"),
  dataNascimento: z.string().min(10, "Data inválida"),
  email: z.string().email("E-mail inválido"),
  celular: z.string().min(14, "Telefone incompleto"),
});

export type PersonalForm = z.infer<typeof personalSchema>;