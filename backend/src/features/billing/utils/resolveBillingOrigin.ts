import { AppError } from "../../../errors/AppError.js";

type BillingOriginRef =
    | { origin: 'sessao'; originId: number; source: 'sessao' | 'evolucao' }
    | { origin: 'ata'; originId: number; source: 'ata' };

export function resolveBillingOrigin(row: {
    sessao_id: number | null;
    evolucao_id: number | null;
    ata_id: number | null;
}): BillingOriginRef {
    const candidates = [
        row.sessao_id ? ('sessao' as const) : null,
        row.evolucao_id ? ('evolucao' as const) : null,
        row.ata_id ? ('ata' as const) : null,
    ].filter((x): x is 'sessao' | 'evolucao' | 'ata' => x !== null);

    if (candidates.length !== 1) {
        throw new AppError(
            "BILLING_TARGET_CONFLICT",
            "Faturamento com múltiplas origens vinculadas.",
            500
        );
    }

    const [only] = candidates;
    if (!only) {
        throw new AppError(
            "BILLING_TARGET_NOT_FOUND",
            "Faturamento sem origem vinculada.",
            500
        );
    }

    if (only === 'ata') {
        return { origin: 'ata', originId: row.ata_id!, source: 'ata' };
    }

    const originId = only === 'sessao' ? row.sessao_id! : row.evolucao_id!;
    return { origin: 'sessao', originId, source: only };
}

export function buildBillingFrontId(ref: BillingOriginRef): string {
    return `${ref.origin}_${ref.originId}`;
}