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
    valor_cliente_sessao: true,
    valor_sessao_consultorio: true,
    valor_sessao_homecare: true,
    valor_hora_desenvolvimento_materiais: true,
    valor_hora_supervisao_recebida: true,
    valor_hora_supervisao_dada: true,
    valor_hora_reuniao: true,
    criado_em: true,
    atualizado_em: true,
});

export type ClienteTherapistLinkListItem = Prisma.terapeuta_clienteGetPayload<{
    select: typeof ClienteTherapistLinkListSelect;
}>;