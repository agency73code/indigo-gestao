import type { Prisma } from '@prisma/client';
import type { AnamnesePayload } from '../../../schemas/anamnese.schema.js';

type Header = AnamnesePayload['cabecalho'];

export function buildHeader(header: Header): Pick<
  Prisma.anamneseCreateInput,
  | 'data_entrevista'
  | 'informante'
  | 'parentesco'
  | 'parentesco_descricao'
  | 'quem_indicou'
  | 'cliente'
  | 'terapeuta'
> {
  return {
    cliente: { connect: { id: header.clienteId } },
    terapeuta: { connect: { id: header.profissionalId } },

    data_entrevista: new Date(header.dataEntrevista),
    informante: header.informante,
    parentesco: header.parentesco,
    parentesco_descricao: header.parentescoDescricao ?? null,
    quem_indicou: header.quemIndicou ?? null,
  };
}