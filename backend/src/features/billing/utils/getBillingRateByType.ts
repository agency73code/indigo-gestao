import { Prisma, type faturamento_tipo_atendimento } from "@prisma/client";

export function getBillingRateByType(
    values: Record<faturamento_tipo_atendimento, Prisma.Decimal | null>,
    typeService: faturamento_tipo_atendimento,
): Prisma.Decimal {
    const value = values[typeService];

    if (!value) {
        return new Prisma.Decimal(0);
    }

    return value;
}