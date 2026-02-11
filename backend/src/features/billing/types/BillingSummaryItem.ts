import type { Prisma, faturamento_tipo_atendimento } from "@prisma/client";

export type BillingSummaryItem = {
    inicio_em: Date;
    fim_em: Date;
    tipo_atendimento: faturamento_tipo_atendimento;
    status: "pendente" | "aprovado" | "rejeitado";
    valor_ajuda_custo: Prisma.Decimal | null;
    terapeuta: {
        valor_hora_desenvolvimento_materiais: Prisma.Decimal | null;
        valor_hora_reuniao: Prisma.Decimal | null;
        valor_hora_supervisao_dada: Prisma.Decimal | null;
        valor_hora_supervisao_recebida: Prisma.Decimal | null;
        valor_sessao_consultorio: Prisma.Decimal | null;
        valor_sessao_homecare: Prisma.Decimal | null;
    };
};