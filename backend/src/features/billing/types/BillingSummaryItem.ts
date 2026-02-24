import type { Prisma, faturamento_tipo_atendimento } from "@prisma/client";

export type BillingSummaryItem = {
    inicio_em: Date;
    fim_em: Date;
    tipo_atendimento: faturamento_tipo_atendimento;
    status: "pendente" | "aprovado" | "rejeitado";
    valor_ajuda_custo: Prisma.Decimal | null;
    terapeuta_id: string;
    cliente: {
        terapeuta: Array<{
            terapeuta_id: string;
            valor_sessao_consultorio: Prisma.Decimal;
            valor_sessao_homecare: Prisma.Decimal;
            valor_hora_desenvolvimento_materiais: Prisma.Decimal;
            valor_hora_supervisao_recebida: Prisma.Decimal;
            valor_hora_supervisao_dada: Prisma.Decimal;
            valor_hora_reuniao: Prisma.Decimal;
        }>;
    };
};