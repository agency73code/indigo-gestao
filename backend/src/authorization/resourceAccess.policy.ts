/**
 * Regra:
 * - scope none: ninguém (exceto o próprio cliente quando clienteId === userId)
 * - scope all: pode baixar tudo
 * - scope partial: pode baixar se:
 *   - arquivo do terapeuta: terapeutaId está no therapistIds
 *   - arquivo do cliente: existe vínculo ativo terapeuta_cliente com terapeuta_id ∈ therapistIds
 */

import { prisma } from "../config/database.js";
import type { VisibilityScope } from "../utils/visibilityFilter.js";
import type { Ownership } from "./types/policy.types.js";

export async function canAccessThis(params: {
    ownership: Ownership,
    userId: string,
    visibility: VisibilityScope,
}): Promise<boolean> {
    const { ownership, userId, visibility } = params;

    // registro do CLIENTE: o próprio cliente sempre pode
    if (ownership.clientId && ownership.clientId === userId) return true;

    // Se não é o próprio cliente, depende do escopo do usuário logado
    if (visibility.scope === 'none') return false;
    if (visibility.scope === 'all') return true;

    // A partir daqui é partial
    const now = new Date();

    const link = await prisma.terapeuta_cliente.findFirst({
        where: {
            cliente_id: ownership.clientId,
            status: 'active',
            data_inicio: { lte: now },
            OR: [
                { data_fim: null },
                { data_fim: { gt: now } },
            ],
            terapeuta_id: { in: visibility.therapistIds },
        },
        select: { id: true },
    });

    return Boolean(link);
}