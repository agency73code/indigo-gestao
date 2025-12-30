import type { Prisma } from "@prisma/client";
import type { TherapistListQuery, TherapistSelectQuery } from "../../../../schemas/queries/therapists.schema.js";
import { getVisibilityScope } from "../../../../utils/visibilityFilter.js";
import { ACCESS_LEVELS } from "../../../../utils/accessLevels.js";
import { prisma } from "../../../../config/database.js";

const SUPERVISOR_LEVEL = 3;

function normalizeCargoName(name?: string | null) {
    return name?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() ?? 'Cargo sem nome';
}

function matchesRole(cargoName: string | null | undefined, role?: TherapistSelectQuery['role']) {
    if (!role) return true;
    const normalized = normalizeCargoName(cargoName);
    const level = ACCESS_LEVELS[normalized] ?? 0;
    if (role === 'supervisor') return level >= SUPERVISOR_LEVEL;
    return level > 0 && level < SUPERVISOR_LEVEL;
}

export async function listTherapists(userId: string, query: TherapistListQuery) {
    const whereBase: Prisma.terapeutaWhereInput = {};

    if (query.search?.trim()) {
        whereBase.nome = { contains: query.search.trim() };
    }

    const visibility = await getVisibilityScope(userId);

    if (visibility.scope === 'none') return [];

    const extraFilters: Prisma.terapeutaWhereInput[] = [];

    if (visibility.scope === 'partial') {
        extraFilters.push({
            OR: [
                { id: { in: visibility.therapistIds } },
                {
                    supervisionados: {
                        some: { clinico_id: { in: visibility.therapistIds } },
                    },
                },
            ],
        });
    }

    if (visibility.maxAccessLevel < (ACCESS_LEVELS['gerente'] ?? 5)) {
        extraFilters.push({ atividade: true });
    }

    const records = await prisma.terapeuta.findMany({
        where: extraFilters.length ? { AND: [whereBase, ...extraFilters] } : whereBase,
        select: {
            id: true,
            nome: true,
            arquivos: {
                where: { tipo: 'fotoPerfil' },
                select: { arquivo_id: true },
                take: 1,
            },
            registro_profissional: {
                select: {
                    cargo: { select: { nome: true } },
                    area_atuacao: { select: { nome: true } },
                    numero_conselho: true,
                },
                orderBy: { id: 'asc' },
            },
        },
        orderBy: { nome: 'asc' },
        ...(query.limit ? { take: query.limit } : {}),
    });

    return records;
}

export async function selectTherapists(userId: string, query: TherapistSelectQuery) {
    const whereBase: Prisma.terapeutaWhereInput = {};

    if (query.search?.trim()) {
        whereBase.nome = { contains: query.search.trim() };
    }

    const visibility = await getVisibilityScope(userId);

    if (visibility.scope === 'none') return [];

    const extraFilters: Prisma.terapeutaWhereInput[] = [];

    if (visibility.scope === 'partial') {
        extraFilters.push({
            OR: [
                { id: { in: visibility.therapistIds } },
                {
                    supervisionados: {
                        some: { clinico_id: { in: visibility.therapistIds } },
                    },
                },
            ],
        });
    }

    if (visibility.maxAccessLevel < (ACCESS_LEVELS['gerente'] ?? 5)) {
        extraFilters.push({ atividade: true });
    }

    const records = await prisma.terapeuta.findMany({
        where: extraFilters.length ? { AND: [whereBase, ...extraFilters] } : whereBase,
        select: {
            id: true,
            nome: true,
            arquivos: {
                where: { tipo: 'fotoPerfil' },
                select: { arquivo_id: true },
                take: 1,
            },
            registro_profissional: {
                select: {
                    cargo: { select: { nome: true } },
                    area_atuacao: { select: { nome: true } },
                    numero_conselho: true,
                },
                orderBy: { id: 'asc' },
                take: 1,
            },
        },
        orderBy: { nome: 'asc' },
        ...(query.limit ? { take: query.limit } : {}),
    });

    if (!query.role) return records;
    
    return records.filter((record) =>
        matchesRole(record.registro_profissional?.[0]?.cargo?.nome ?? null, query.role),
    )
}