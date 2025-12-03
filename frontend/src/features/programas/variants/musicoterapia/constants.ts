/**
 * Constantes centralizadas para Musicoterapia
 * Garante consistência entre tipos, componentes e backend
 */

// Identificador de área para backend (consistente com AreaContext)
export const MUSI_AREA_ID = 'musicoterapia' as const;

// Label legível da área
export const MUSI_AREA_LABEL = 'Musicoterapia' as const;

// Tipos de performance (kebab-case para API e componentes)
export const MUSI_PERFORMANCE_TYPES = {
  NAO_DESEMPENHOU: 'nao-desempenhou',
  DESEMPENHOU_COM_AJUDA: 'desempenhou-com-ajuda',
  DESEMPENHOU: 'desempenhou',
} as const;

// Labels de exibição para cada tipo de performance
export const MUSI_PERFORMANCE_LABELS = {
  [MUSI_PERFORMANCE_TYPES.NAO_DESEMPENHOU]: 'Não Desempenhou',
  [MUSI_PERFORMANCE_TYPES.DESEMPENHOU_COM_AJUDA]: 'Desempenhou com Ajuda',
  [MUSI_PERFORMANCE_TYPES.DESEMPENHOU]: 'Desempenhou',
} as const;

// Cores para cada tipo de performance (consistente com sistema de design)
export const MUSI_PERFORMANCE_COLORS = {
  [MUSI_PERFORMANCE_TYPES.NAO_DESEMPENHOU]: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-500/40',
    hex: '#ef4444', // red-500
  },
  [MUSI_PERFORMANCE_TYPES.DESEMPENHOU_COM_AJUDA]: {
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-500/40',
    hex: '#f59e0b', // amber-500
  },
  [MUSI_PERFORMANCE_TYPES.DESEMPENHOU]: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-500/40',
    hex: '#22c55e', // green-500
  },
} as const;

// Helpers para conversão entre formatos
export const MusiPerformanceHelpers = {
  /**
   * Converte formato de API (kebab-case) para camelCase interno
   */
  fromApi: (apiValue: string): string => {
    switch (apiValue) {
      case 'nao-desempenhou':
        return 'naoDesempenhou';
      case 'desempenhou-com-ajuda':
        return 'desempenhouComAjuda';
      case 'desempenhou':
        return 'desempenhou';
      default:
        return apiValue;
    }
  },

  /**
   * Converte formato interno (camelCase) para API (kebab-case)
   */
  toApi: (internalValue: string): string => {
    switch (internalValue) {
      case 'naoDesempenhou':
        return 'nao-desempenhou';
      case 'desempenhouComAjuda':
        return 'desempenhou-com-ajuda';
      case 'desempenhou':
        return 'desempenhou';
      default:
        return internalValue;
    }
  },

  /**
   * Retorna label legível para o tipo de performance
   */
  getLabel: (type: string): string => {
    return MUSI_PERFORMANCE_LABELS[type as keyof typeof MUSI_PERFORMANCE_LABELS] || type;
  },

  /**
   * Retorna classes de cor para o tipo de performance
   */
  getColors: (type: string) => {
    return MUSI_PERFORMANCE_COLORS[type as keyof typeof MUSI_PERFORMANCE_COLORS] || {
      text: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-500/40',
      hex: '#6b7280',
    };
  },
};

// Tipos de documento para upload
export const MUSI_DOCUMENT_TYPES = [
  { value: 'laudo', label: 'Laudo' },
  { value: 'avaliacao', label: 'Avaliação' },
  { value: 'relatorio', label: 'Relatório' },
  { value: 'outro', label: 'Outro' },
] as const;
