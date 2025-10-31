import { prisma } from "../../../../config/database.js";
import { normalizeSupervisionLinks } from "../normalizers/supervisionLinkNormalizer.js";

/**
 * Busca vínculos de supervisão no banco de dados.
 * Retorna os 10 mais recentes, ordenados por data de criação.
 */
export async function getAllSupervisionLinks() {
    const vinculos = await prisma.vinculo_supervisao.findMany({
        take: 10,
        orderBy: { criado_em: 'desc' },
    });

    return normalizeSupervisionLinks(vinculos);
}