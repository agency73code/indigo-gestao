import type { LucideIcon } from 'lucide-react';

export type AreaId = 
    | 'fonoaudiologia'
    | 'psicopedagogia'
    | 'terapia-aba'
    | 'terapia-ocupacional'
    | 'psicoterapia'
    | 'fisioterapia'
    | 'psicomotricidade'
    | 'educacao-fisica'
    | 'musicoterapia'
    | 'neuropsicologia';

export interface AreaMeta {
    id: AreaId;
    title: string;
    subtitle?: string;
    path: string; // rota base da área, ex: /programas/terapia-ocupacional
    icon?: LucideIcon;
    implemented?: boolean | 'in-progress'; // true = pronto, 'in-progress' = quase pronto, false = planejamento
}
