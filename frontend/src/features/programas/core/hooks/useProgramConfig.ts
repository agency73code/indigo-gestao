import { MessageSquareText, Hand, Footprints, Music, Heart, Brain, Puzzle, Activity, Dumbbell, BookOpen } from 'lucide-react';
import type { User } from '@/features/auth/types/auth.types';
import type { AreaId, AreaMeta } from '../config/types';
import { getAccessLevel } from '@/features/cadastros';

type AreaInput = AreaId | AreaId[] | null | undefined;
type AreaSource = AreaInput | Pick<User, 'area_atuacao'> | { area_atuacao?: AreaInput } | null;

const PROGRAM_AREAS: AreaMeta[] = [
    // Áreas implementadas (aparecem primeiro)
    { 
        id: 'fonoaudiologia', 
        title: 'Fonoaudiologia', 
        path: '/app/programas/fonoaudiologia',
        icon: MessageSquareText,
        implemented: true
    },
    { 
        id: 'psicopedagogia', 
        title: 'Psicopedagogia', 
        path: '/app/programas/psicopedagogia',
        icon: BookOpen,
        implemented: true
    },
    { 
        id: 'terapia-aba', 
        title: 'Terapia ABA', 
        path: '/app/programas/terapia-aba',
        icon: Puzzle,
        implemented: true
    },
    { 
        id: 'terapia-ocupacional', 
        title: 'Terapia Ocupacional', 
        path: '/app/programas/terapia-ocupacional',
        icon: Hand,
        implemented: true
    },
    // Áreas em planejamento
    { 
        id: 'psicoterapia', 
        title: 'Psicoterapia', 
        path: '/app/programas/psicoterapia',
        icon: Heart,
        implemented: false
    },
    { 
        id: 'musicoterapia', 
        title: 'Musicoterapia', 
        path: '/app/programas/musicoterapia',
        icon: Music,
        implemented: 'in-progress'
    },
    { 
        id: 'fisioterapia', 
        title: 'Fisioterapia', 
        path: '/app/programas/fisioterapia',
        icon: Activity,
        implemented: true
    },
    { 
        id: 'psicomotricidade', 
        title: 'Psicomotricidade', 
        path: '/app/programas/psicomotricidade',
        icon: Footprints,
        implemented: true
    },
    { 
        id: 'educacao-fisica', 
        title: 'Educação Física', 
        path: '/app/programas/educacao-fisica',
        icon: Dumbbell,
        implemented: true
    },
    { 
        id: 'neuropsicologia', 
        title: 'Neuropsicologia', 
        path: '/app/programas/neuropsicologia',
        icon: Brain,
        implemented: false
    },
];

function normalizeAreaInput(areaInput: AreaInput): AreaId[] | null {
    if (!areaInput) return null;
    return Array.isArray(areaInput) ? areaInput : [areaInput];
}

function resolveAllowedAreas(source?: AreaSource): AreaId[] | null {
    if (!source) return null;

    if (typeof source === 'string' || Array.isArray(source)) {
        return normalizeAreaInput(source as AreaInput);
    }

    return normalizeAreaInput(source.area_atuacao);
}

function hasPerfilAcesso(source: unknown): source is { perfil_acesso: string } {
    return (
        typeof source === 'object' &&
        source !== null &&
        'perfil_acesso' in source &&
        typeof (source as any).perfil_acesso === 'string'
    );
}

export function useProgramAreas(source?: AreaSource): AreaMeta[] {
    console.log(source);
    if (hasPerfilAcesso(source)) {
        const level = getAccessLevel(source.perfil_acesso);

        if (level >= 5) {
            return PROGRAM_AREAS;
        }
    }

    const allowedAreas = resolveAllowedAreas(source);

    if (!allowedAreas || allowedAreas.length === 0) {
        return PROGRAM_AREAS;
    }

    const allowedSet = new Set<AreaId>(allowedAreas);
    return PROGRAM_AREAS.filter((area) => allowedSet.has(area.id));
}
