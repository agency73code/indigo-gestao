import type { Prisma } from '@prisma/client';
import { prisma } from '../../../../config/database.js';
import { getVisibilityScope } from '../../../../utils/visibilityFilter.js';
import { ACCESS_LEVELS } from '../../../../utils/accessLevels.js';

const MANAGER_LEVEL = ACCESS_LEVELS['gerente'] ?? 5;

function buildVisibilityFilters(userId: string) {
    return getVisibilityScope(userId);
}

export async function findClientOptions(userId: string, search?: string, limit = 20) {
    const visibility = await buildVisibilityFilters(userId);

    if (visibility.scope === 'none') {
        return [];
    }

    const whereBase: Prisma.clienteWhereInput = {};

    if (search && search.trim() !== '') {
        whereBase.nome = {
            contains: search.trim(),
        };
    }

    const extraFilters: Prisma.clienteWhereInput[]= [];

    if (visibility.scope === 'partial') {
        extraFilters.push({
            terapeuta: {
                some: {
                    terapeuta_id: { in: visibility.therapistIds },
                    ...(visibility.maxAccessLevel < MANAGER_LEVEL ? { status: 'active' } : {}),
                },
            },
        });
    }

    if (visibility.maxAccessLevel < MANAGER_LEVEL) {
        extraFilters.push({ status: 'ativo' });
    }

    const finalWhere: Prisma.clienteWhereInput =
        extraFilters.length > 0 ? { AND: [whereBase, ...extraFilters] } : whereBase;

    return prisma.cliente.findMany({
        where: finalWhere,
        select: {
            id: true,
            nome: true,
            arquivos: {
                where: { tipo: 'fotoPerfil' },
                select: { arquivo_id: true },
                take: 1,
            },
        },
        orderBy: { nome: 'asc' },
        take: limit,
    });
}

export async function findClientList(
    userId: string,
    search?: string,
    includeResponsavel?: boolean,
    limit = 100,
) {
    const visibility = await buildVisibilityFilters(userId);

    if (visibility.scope === 'none') {
        return [];
    }

    const whereBase: Prisma.clienteWhereInput = {};

    if (search && search.trim() !== '') {
        whereBase.nome = {
            contains: search.trim(),
        };
    }

    const extraFilters: Prisma.clienteWhereInput[] = [];

    if (visibility.scope === 'partial') {
        extraFilters.push({
            terapeuta: {
                some: {
                    terapeuta_id: { in: visibility.therapistIds },
                    ...(visibility.maxAccessLevel < MANAGER_LEVEL ? { status: 'active' } : {}),
                },
            },
        });
    }

    if (visibility.maxAccessLevel < MANAGER_LEVEL) {
        extraFilters.push({ status: 'ativo' });
    }

    const finalWhere: Prisma.clienteWhereInput =
        extraFilters.length > 0 ? { AND: [whereBase, ...extraFilters] } : whereBase;
    
    return prisma.cliente.findMany({
        where: finalWhere,
        select: {
            id: true,
            nome: true,
            dataNascimento: true,
            
            ...(includeResponsavel && {
                cuidadores: {
                    select: { nome: true },
                    orderBy: { id: 'asc' },
                    take: 1,
                },
            }),

            arquivos: {
                where: { tipo: 'fotoPerfil' },
                select: { arquivo_id: true },
                take: 1,
            },
        },
        orderBy: { nome: 'asc' },
        take: limit,
    });
}