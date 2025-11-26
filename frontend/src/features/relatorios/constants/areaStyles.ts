import { 
  Activity, 
  Brain, 
  Music, 
  Dumbbell,
  Baby,
  GraduationCap,
  Heart,
  type LucideIcon 
} from 'lucide-react';
import type { AreaType } from '@/contexts/AreaContext';

/**
 * Configurações visuais (ícone e cores) para cada área terapêutica
 * Baseado nos padrões já utilizados no sistema (HubPage, AreaHubTOPage, etc.)
 */

interface AreaStyle {
  icon: LucideIcon;
  /** Classe Tailwind para cor do ícone (ex: text-blue-600) */
  iconColor: string;
  /** Classe Tailwind para cor de fundo (ex: bg-blue-100) */
  bgColor: string;
  /** Cor hex para uso em badges e outros elementos (ex: #3B82F6) */
  color: string;
}

export const AREA_STYLES: Record<AreaType, AreaStyle> = {
  'fonoaudiologia': {
    icon: Activity,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    color: '#3B82F6',
  },
  'terapia-ocupacional': {
    icon: Brain,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
    color: '#9333EA',
  },
  'psicoterapia': {
    icon: Heart,
    iconColor: 'text-pink-600',
    bgColor: 'bg-pink-100',
    color: '#EC4899',
  },
  'fisioterapia': {
    icon: Dumbbell,
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-100',
    color: '#EA580C',
  },
  'psicomotricidade': {
    icon: Baby,
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-100',
    color: '#0D9488',
  },
  'educacao-fisica': {
    icon: Dumbbell,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
    color: '#16A34A',
  },
  'terapia-aba': {
    icon: Brain,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    color: '#4F46E5',
  },
  'musicoterapia': {
    icon: Music,
    iconColor: 'text-violet-600',
    bgColor: 'bg-violet-100',
    color: '#7C3AED',
  },
  'neuropsicologia': {
    icon: Brain,
    iconColor: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    color: '#0891B2',
  },
  'psicopedagogia': {
    icon: GraduationCap,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    color: '#CA8A04',
  },
};

/**
 * Retorna o estilo (ícone e cores) para uma área específica
 * Fallback para fonoaudiologia caso a área não seja encontrada
 */
export function getAreaStyle(area: AreaType | null | undefined): AreaStyle {
  if (!area) {
    return AREA_STYLES['fonoaudiologia'];
  }
  return AREA_STYLES[area] || AREA_STYLES['fonoaudiologia'];
}
