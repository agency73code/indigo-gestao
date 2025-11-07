import type { LucideIcon } from 'lucide-react';

export type AreaId = 'fono-psico' | 'terapia-ocupacional' | 'movimento' | 'musicoterapia';

export interface AreaMeta {
    id: AreaId;
    title: string;
    subtitle?: string;
    path: string; // rota base da área, ex: /programas/terapia-ocupacional
    icon?: LucideIcon;
}
