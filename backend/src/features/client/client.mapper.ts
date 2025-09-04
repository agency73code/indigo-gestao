import { PrismaClient } from "@prisma/client";
import type { ClientCreateData } from "./client.types.js";
import { v4 as uuidv4 } from "uuid";

function asDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  const s = input.trim();
  return s.length === 10 ? new Date(`${s}T00:00:00`) : new Date(s);
}

export function mapClienteBase(input: ClientCreateData) {
  return {
    id: uuidv4(),
    nome: input.nome,
    data_nascimento: asDate(input.data_nascimento),
    email_contato: input.email_contato,
    data_entrada: asDate(input.data_entrada),
    perfil_acesso: input.perfil_acesso,
  };
}

export async function createClienteBase(
  prisma: PrismaClient,
  payload: ClientCreateData
) {
  const data = mapClienteBase(payload);
  return prisma.cliente.create({ data });
}