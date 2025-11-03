import { prisma } from "../../../../config/database.js";
import { normalizeSupervisionLinks } from "../normalizers/supervisionLinkNormalizer.js";
import type { LinkFilters } from "../types/supervisionLink.types.js";

/**
 * Busca vínculos de supervisão no banco de dados.
 * Retorna todos os vínculos, ordenados por data de criação.
 */
export async function getAllSupervisionLinks(filters?: LinkFilters) {
    const where = buildWhere(filters);
    const orderBy = buildOrderBy(filters);

    const vinculos = await prisma.vinculo_supervisao.findMany({
        where,
        orderBy,
        include: {
            supervisor: {
                include: {
                    registro_profissional: {
                        include: { area_atuacao: true },
                    },
                },
            },
            clinico: {
                include: {
                    registro_profissional: {
                        include: { area_atuacao: true },
                    },
                },
            },
        },
    });

    return normalizeSupervisionLinks(vinculos);
}

/**
 * Monta dinamicamente o objeto "where" de acordo com os filtros recebidos.
 */
function buildWhere(filters?: LinkFilters) {
    if (!filters) return {};

    const { status, q } = filters;

    const where: Record<string, unknown> = {};

    // Filtro de status
    if (status && status !== 'all') {
        where.status = translateStatusFilter(status);
    }

    // Filtro de busca textual
    if (q) {
        where.OR = [
            { supervisor: { nome: { contains: q } } },
            { supervisor: { email: { contains: q } } },
            { supervisor: { email_indigo: { contains: q } } },
            { supervisor: { cpf: { contains: q } } },
            { supervisor: { celular: { contains: q } } },
            { supervisor: { telefone: { contains: q } } },
            {
                supervisor: {
                    registro_profissional: {
                        some: {
                            area_atuacao: { nome: { contains: q } },
                        },
                    },
                },
            },
            { clinico: { nome: { contains: q } } },
            { clinico: { email: { contains: q } } },
            { clinico: { email_indigo: { contains: q } } },
            { clinico: { cpf: { contains: q } } },
            { clinico: { celular: { contains: q } } },
            { clinico: { telefone: { contains: q } } },
            {
                clinico: {
                    registro_profissional: {
                        some: {
                            area_atuacao: { nome: { contains: q } },
                        },
                    },
                },
            },
        ];
    }

    return where;
}

/**
 * Define a ordenação dos resultados conforme o filtro.
 */
function buildOrderBy(filters?: LinkFilters) {
  const recent = filters?.orderBy === 'recent';
  return { criado_em: recent ? 'desc' : 'asc' } as const;
}

/**
 * Converte o status do frontend (en-US) para o formato do banco (pt-BR).
 */
function translateStatusFilter(status: LinkFilters['status']) {
    switch (status) {
        case 'active':
            return 'ativo';
        case 'ended':
            return 'encerrado';
        case 'archived':
            return 'arquivado';
        default:
            return undefined;
    }
}