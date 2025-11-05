import type { AreaMeta } from '../config/types';

export function useProgramAreas(): AreaMeta[] {
    // Base (fono-psico) já existe no sistema; as demais são placeholders
    return [
        { id: 'fono-psico', title: 'Fonoaudiologia & Psicopedagogia', path: '/app/programas/fono-psico' },
        { id: 'terapia-ocupacional', title: 'Terapia Ocupacional', path: '/app/programas/terapia-ocupacional' },
        { id: 'movimento', title: 'Sessão de Movimento', path: '/app/programas/movimento' },
        { id: 'musicoterapia', title: 'Musicoterapia', path: '/app/programas/musicoterapia' },
    ];
}
