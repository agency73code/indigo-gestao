/**
 * Regra:
 * - scope none: ninguém (exceto o próprio cliente quando clienteId === userId)
 * - scope all: pode baixar tudo
 * - scope partial: pode baixar se:
 *   - arquivo do terapeuta: terapeutaId está no therapistIds
 *   - arquivo do cliente: existe vínculo ativo terapeuta_cliente com terapeuta_id ∈ therapistIds
 */

import { prisma } from "../../../config/database.js";
import type { VisibilityScope } from "../../../utils/visibilityFilter.js";
import type { DbFileForAuth } from "../types/files.types.js";

export async function canDownloadFile(params: {
    file: DbFileForAuth;
    userId: string;
    visibility: VisibilityScope;
}): Promise<boolean> {
    const { file, userId, visibility } = params;

    // Arquivo do CLIENTE: o próprio cliente sempre pode
    if (file.clienteId && file.clienteId === userId) return true;

    // Se não é o próprio cliente, depende do escopo do usuário logado
    if (visibility.scope === 'none') return false;
    if (visibility.scope === 'all') return true;

    // A partir daqui é partial
    // Arquivo do TERAPEUTA: só se o dono estiver no escopo
    if (file.terapeutaId) {
        return visibility.therapistIds.includes(file.terapeutaId)
    }

    // Arquivo do CLIENTE: precisa vínculo ativo com algum terapeuta permitido
    if (file.clienteId) {
        const now = new Date();

        const link = await prisma.terapeuta_cliente.findFirst({
            where: {
                cliente_id: file.clienteId,
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

    // Sem dono definido (inconsistente)
    return false;
}