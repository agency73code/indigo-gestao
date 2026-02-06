import type { faturamento_tipo_atendimento, Prisma } from "@prisma/client";

export function getBillingRateByType(
    values: Record<faturamento_tipo_atendimento, Prisma.Decimal | null>,
    typeService: faturamento_tipo_atendimento,
): number {
    const value = values[typeService];

    if (!value) {
        throw new Error(`Valor não configurado para o tipo ${typeService}`);
    }

    return value.toNumber();
}