import { getTherapistData } from '../cache/therapistCache.js';
import { AppError } from '../errors/AppError.js';
import { ACCESS_LEVELS } from './accessLevels.js';
import { defineAbilityForLevel } from '../abilities/defineAbility.js';
import { prisma } from '../config/database.js';

export type VisibilityScope =
    | { scope: 'none'; therapistIds: []; maxAccessLevel: number }
    | { scope: 'all'; therapistIds: null; maxAccessLevel: number }
    | { scope: 'partial'; therapistIds: string[]; maxAccessLevel: number };

export async function getVisibilityScope(therapistId: string): Promise<VisibilityScope> {
    const registers = await getTherapistData(therapistId);

    if (!registers.length) {
        throw new AppError(
            'REQUIRED_THERAPIST_REGISTER',
            'Terapeuta sem registro profissional.',
            400,
        );
    }

    // --- Normaliza e identifica o maior nível de acesso ---
    const cargos = registers
        .map((r) =>
            r.cargo?.nome
                ?.toLowerCase()
                .normalize('NFD')
                .replace(/\p{Diacritic}/gu, ''),
        )
        .filter(Boolean) as string[];

    const levels = cargos.map((c) => ACCESS_LEVELS[c] ?? 0);
    const maxLevel = levels.length > 0 ? Math.max(...levels) : 0;
    const ability = defineAbilityForLevel(maxLevel);

    // --- Sem permissão CASL ---
    if (!ability.can('read', 'Consultar')) {
        return { scope: 'none', therapistIds: [], maxAccessLevel: maxLevel };
    }

    // --- Nível administrativo total ---
    if (maxLevel >= 5) {
        // Retornamos null para sinalizar acesso total e diferenciar de `scope: "none"`.
        return { scope: 'all', therapistIds: null, maxAccessLevel: maxLevel };
    }

    // --- Nível intermediário (coordenação/supervisão) ---
    // Uma única query para cada nível hierárquico
    const firstLevel = await prisma.vinculo_supervisao.findMany({
        where: { supervisor_id: therapistId },
        select: { clinico_id: true },
    });

    const firstIds = firstLevel.map((v) => v.clinico_id);

    let secondIds: string[] = [];
    if (maxLevel === 4 && firstIds.length > 0) {
        const secondLevel = await prisma.vinculo_supervisao.findMany({
            where: { supervisor_id: { in: firstIds } },
            select: { clinico_id: true },
        });
        secondIds = secondLevel.map((v) => v.clinico_id);
    }

    // --- Junta todos os IDs ---
    const allIds = new Set<string>([therapistId, ...firstIds, ...secondIds]);

    // --- AT: ele mesmo + supervisor(es) ---
    if (maxLevel === 1) {
        const supervisors = await prisma.vinculo_supervisao.findMany({
            where: { clinico_id: therapistId },
            select: { supervisor_id: true },
        });
        const supervisorIds = supervisors.map((v) => v.supervisor_id);
        return { scope: 'partial', therapistIds: [therapistId, ...supervisorIds], maxAccessLevel: maxLevel };
    }

    // --- Terapeuta clínico: só ele mesmo ---
    if (maxLevel === 2) {
        return { scope: 'partial', therapistIds: [therapistId], maxAccessLevel: maxLevel };
    }

    return {
        scope: 'partial',
        therapistIds: Array.from(allIds),
        maxAccessLevel: maxLevel,
    };
}

// Mantido por compatibilidade. Para novos usos prefira `getVisibilityScope`.
export async function getVisibleTherapistIds(therapistId: string): Promise<string[]> {
    const visibility = await getVisibilityScope(therapistId);
    return visibility.scope === 'partial' ? visibility.therapistIds : [];
}
