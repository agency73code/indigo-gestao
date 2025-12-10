import { prisma } from '../config/database.js';

type TherapistCacheEntry = {
    registros: {
        cargo: { nome: string } | null;
        area_atuacao: { nome: string };
    }[];
    updatedAt: number;
};

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hora
const therapistCache = new Map<string, TherapistCacheEntry>();

export async function getTherapistData(therapistId: string) {
    const cached = therapistCache.get(therapistId);

    if (cached && Date.now() - cached.updatedAt < CACHE_TTL_MS) {
        return cached.registros;
    }

    const registros = await prisma.registro_profissional.findMany({
        where: { terapeuta_id: therapistId },
        include: { cargo: true, area_atuacao: true },
    });

    therapistCache.set(therapistId, { registros, updatedAt: Date.now() });
    return registros;
}

export function invalidateTherapistCache(therapistId: string) {
    therapistCache.delete(therapistId);
}
