/**
 * Constantes centralizadas para Terapia Ocupacional
 * Garante consistência entre tipos, componentes e backend
 */

// Identificador de área para backend (consistente com AreaContext)
export const TO_AREA_ID = 'terapia-ocupacional' as const;

// Label legível da área
export const TO_AREA_LABEL = 'Terapia Ocupacional' as const;

// Tipos de performance (kebab-case para API e componentes)
export const TO_PERFORMANCE_TYPES = {
  NAO_DESEMPENHOU: 'nao-desempenhou',
  DESEMPENHOU_COM_AJUDA: 'desempenhou-com-ajuda',
  DESEMPENHOU: 'desempenhou',
} as const;

// Labels de exibição para cada tipo de performance
export const TO_PERFORMANCE_LABELS = {
  [TO_PERFORMANCE_TYPES.NAO_DESEMPENHOU]: 'Não Desempenhou',
  [TO_PERFORMANCE_TYPES.DESEMPENHOU_COM_AJUDA]: 'Desempenhou com Ajuda',
  [TO_PERFORMANCE_TYPES.DESEMPENHOU]: 'Desempenhou',
} as const;

// Cores para cada tipo de performance (consistente com sistema de design)
export const TO_PERFORMANCE_COLORS = {
  [TO_PERFORMANCE_TYPES.NAO_DESEMPENHOU]: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-500/40',
    hex: '#ef4444', // red-500
  },
  [TO_PERFORMANCE_TYPES.DESEMPENHOU_COM_AJUDA]: {
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-500/40',
    hex: '#f59e0b', // amber-500
  },
  [TO_PERFORMANCE_TYPES.DESEMPENHOU]: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-500/40',
    hex: '#22c55e', // green-500
  },
} as const;

// Helpers para conversão entre formatos
export const ToPerformanceHelpers = {
  /**
   * Converte performance type (kebab-case) para chave de summary (camelCase)
   */
  toSummaryKey: (type: string): 'naoDesempenhou' | 'desempenhouComAjuda' | 'desempenhou' => {
    switch (type) {
      case TO_PERFORMANCE_TYPES.NAO_DESEMPENHOU:
        return 'naoDesempenhou';
      case TO_PERFORMANCE_TYPES.DESEMPENHOU_COM_AJUDA:
        return 'desempenhouComAjuda';
      case TO_PERFORMANCE_TYPES.DESEMPENHOU:
        return 'desempenhou';
      default:
        throw new Error(`Performance type inválido: ${type}`);
    }
  },

  /**
   * Converte chave de summary (camelCase) para performance type (kebab-case)
   */
  fromSummaryKey: (key: string): 'nao-desempenhou' | 'desempenhou-com-ajuda' | 'desempenhou' => {
    switch (key) {
      case 'naoDesempenhou':
        return TO_PERFORMANCE_TYPES.NAO_DESEMPENHOU;
      case 'desempenhouComAjuda':
        return TO_PERFORMANCE_TYPES.DESEMPENHOU_COM_AJUDA;
      case 'desempenhou':
        return TO_PERFORMANCE_TYPES.DESEMPENHOU;
      default:
        throw new Error(`Summary key inválida: ${key}`);
    }
  },

  /**
   * Obtém configuração de cor para um tipo de performance
   */
  getColorConfig: (type: string) => {
    return TO_PERFORMANCE_COLORS[type as keyof typeof TO_PERFORMANCE_COLORS] || TO_PERFORMANCE_COLORS[TO_PERFORMANCE_TYPES.NAO_DESEMPENHOU];
  },

  /**
   * Obtém label legível para um tipo de performance
   */
  getLabel: (type: string): string => {
    return TO_PERFORMANCE_LABELS[type as keyof typeof TO_PERFORMANCE_LABELS] || 'Desconhecido';
  },
};
