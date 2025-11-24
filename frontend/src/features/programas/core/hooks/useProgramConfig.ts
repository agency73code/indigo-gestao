import { MessageSquareText, Hand, Footprints, Music, Heart, Brain, Puzzle, Activity, Dumbbell, BookOpen } from 'lucide-react';
import type { AreaMeta } from '../config/types';

export function useProgramAreas(): AreaMeta[] {
    return [
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
        // Área quase pronta
        { 
            id: 'terapia-ocupacional', 
            title: 'Terapia Ocupacional', 
            path: '/app/programas/terapia-ocupacional',
            icon: Hand,
            implemented: 'in-progress'
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
            implemented: false
        },
        { 
            id: 'fisioterapia', 
            title: 'Fisioterapia', 
            path: '/app/programas/fisioterapia',
            icon: Activity,
            implemented: false
        },
        { 
            id: 'psicomotricidade', 
            title: 'Psicomotricidade', 
            path: '/app/programas/psicomotricidade',
            icon: Footprints,
            implemented: false
        },
        { 
            id: 'educacao-fisica', 
            title: 'Educação Física', 
            path: '/app/programas/educacao-fisica',
            icon: Dumbbell,
            implemented: false
        },
        { 
            id: 'neuropsicologia', 
            title: 'Neuropsicologia', 
            path: '/app/programas/neuropsicologia',
            icon: Brain,
            implemented: false
        },
    ];
}
