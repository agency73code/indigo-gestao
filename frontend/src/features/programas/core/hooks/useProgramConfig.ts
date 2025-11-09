import { MessageSquareText, Hand, Footprints, Music } from 'lucide-react';
import type { AreaMeta } from '../config/types';

export function useProgramAreas(): AreaMeta[] {
    // Base (fono-psico) já existe no sistema; as demais são placeholders
    return [
        { 
            id: 'fono-psico', 
            title: 'Fonoaudiologia & Psicopedagogia', 
            path: '/app/programas/fono-psico',
            icon: MessageSquareText
        },
        { 
            id: 'terapia-ocupacional', 
            title: 'Terapia Ocupacional', 
            path: '/app/programas/terapia-ocupacional',
            icon: Hand
        },
        { 
            id: 'movimento', 
            title: 'Sessão de Movimento', 
            path: '/app/programas/movimento',
            icon: Footprints
        },
        { 
            id: 'musicoterapia', 
            title: 'Musicoterapia', 
            path: '/app/programas/musicoterapia',
            icon: Music
        },
    ];
}
