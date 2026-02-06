import { Prisma } from "@prisma/client";

export const ClienteTherapistLinkListSelect = Prisma.validator<Prisma.terapeuta_clienteSelect>()({
    id: true,
    cliente_id: true,
    terapeuta_id: true,
    papel: true,
    data_inicio: true,
    data_fim: true,
    status: true,
    observacoes: true,
    areaAtuacao: {
        select: { nome: true },
    },
    valor_sessao: true,
    criado_em: true,
    atualizado_em: true,
});

export type ClienteTherapistLinkListItem = Prisma.terapeuta_clienteGetPayload<{
    select: typeof ClienteTherapistLinkListSelect;
}>;