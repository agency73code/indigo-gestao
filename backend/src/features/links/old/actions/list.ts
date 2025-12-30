import type { Prisma } from '@prisma/client';
import { prisma } from '../../../../config/database.js';
import type { LinkFilters } from '../links.types.js';
import { getVisibilityScope } from '../../../../utils/visibilityFilter.js';
import { ACCESS_LEVELS } from '../../../../utils/accessLevels.js';

const MANAGER_LEVEL = ACCESS_LEVELS['gerente'] ?? 5;

export async function getAllLinks(userId: string, filters?: LinkFilters) {
    const whereBase = buildWhere(filters);
    const orderBy = buildOrderBy(filters);

    const visibility = await getVisibilityScope(userId);

    if (visibility.scope === 'none') {
        return [];
    }

    const extraFilters: Prisma.terapeuta_clienteWhereInput[] = [];

    if (visibility.scope === 'partial') {
        extraFilters.push({ terapeuta_id: { in: visibility.therapistIds } });
    }

    if (visibility.maxAccessLevel < MANAGER_LEVEL) {
        extraFilters.push({ status: 'active' });
    }

    const finalWhere = extraFilters.length > 0 ? { AND: [whereBase, ...extraFilters] } : whereBase;

    const links = await prisma.terapeuta_cliente.findMany({
        where: finalWhere,
        take: 50,
        orderBy,
        include: {
            terapeuta: {
                include: {
                    registro_profissional: {
                        include: { area_atuacao: true },
                    },
                },
            },
            cliente: {
                include: {
                    cuidadores: true,
                },
            },
        },
    });

    return links;
}

/**
 * Monta dinamicamente o objeto "where" com base nos filtros recebidos.
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
    if (q && q.trim() !== '') {
        where.OR = [
            // Terapeuta
            { terapeuta: { nome: { contains: q } } },
            { terapeuta: { email: { contains: q } } },
            { terapeuta: { email_indigo: { contains: q } } },
            { terapeuta: { cpf: { contains: q } } },
            {
                terapeuta: {
                    registro_profissional: {
                        some: {
                            area_atuacao: { nome: { contains: q } },
                        },
                    },
                },
            },

            // Cliente
            { cliente: { nome: { contains: q } } },
            { cliente: { emailContato: { contains: q } } },
            { cliente: { cpf: { contains: q } } },

            // Cuidador do cliente
            { cliente: { cuidadores: { some: { nome: { contains: q } } } } },
            { cliente: { cuidadores: { some: { email: { contains: q } } } } },
            { cliente: { cuidadores: { some: { cpf: { contains: q } } } } },
        ];
    }

    return where;
}

/**
 * Define a ordenação conforme o filtro `orderBy` recebido.
 */
function buildOrderBy(filters?: LinkFilters) {
    const recent = filters?.orderBy === 'recent';
    return { atualizado_em: recent ? 'desc' : 'asc' } as const;
}

/**
 * Converte o status do frontend (en-US) para o formato do banco (pt-BR).
 */
function translateStatusFilter(status: LinkFilters['status']) {
    switch (status) {
        case 'active':
            return 'active';
        case 'ended':
            return 'ended';
        case 'archived':
            return 'archived';
        default:
            return undefined;
    }
}
