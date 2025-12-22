export type RegistroTentativa = {
  tentativa: number;
  resultado: 'acerto' | 'ajuda' | 'erro';
  estimuloId: string;
};

export type Sessao = {
  id: string;
  pacienteId: string;
  terapeutaId: string;
  data: string; // ISO
  programaId: string;
  programaNome: string;
  objetivo: string;
  prazoInicio?: string;
  prazoFim?: string;
  registros: RegistroTentativa[];
};

export type KpisRelatorio = {
  acerto: number;          // %
  independencia: number;   // %
  tentativas: number;
  sessoes: number;
  assiduidade?: number;    // %
  gapIndependencia?: number; // acerto - independencia
};

export type SerieLinha = { 
  x: string; 
  acerto: number; 
  independencia: number;
  ajuda?: number;
  erro?: number;
};

export type Filters = {
  pacienteId?: string;
  periodo: { 
    mode: '30d'|'90d'|'custom'; 
    start?: string; 
    end?: string; 
  };
  programaId?: string;
  estimuloId?: string;
  terapeutaId?: string;
  comparar?: boolean;
};

export type PrazoPrograma = {
  percent: number;
  label: string;
  inicio?: string;
  fim?: string;
};

export type LinhaBarras = {
  sessao: string;
  acerto: number;
  ajuda: number;
};

// Tipos para Estímulos que precisam de atenção
export type AttentionStimulusItem = {
  id: string;
  label: string;
  counts: {
    erro: number;
    ajuda: number;
    indep: number;
  };
  total: number;
  independence: number; // % de independência
  status: 'atencao' | 'mediano' | 'positivo' | 'insuficiente';
};

export type AttentionStimuliParams = {
  pacienteId: string;
  programaId?: string;
  terapeutaId?: string;
  periodo?: {
    mode: '30d' | '90d' | 'custom';
    start?: string;
    end?: string;
  };
  lastSessions: 1 | 3 | 5; // Filtro de últimas N sessões
  area: string;
};

export type AttentionStimuliResponse = {
  items: AttentionStimulusItem[];
  total: number;
  hasSufficientData: boolean; // Se tem tentativas suficientes (>= 5)
};

// Modelo de retorno musicoterapia
export interface MediaTendencia {
  media: number;
  tendencia: number;
  totalRegistros: number;
}

export interface CalculateAverageAndTrend {
  participation: MediaTendencia;
  support: MediaTendencia;
}

export interface MusiKpis {
  atividadesTotal: number;
  avgParticipacao: number;
  avgSuporte: number;
  desempenhou: number;
  desempenhouComAjuda: number;
  naoDesempenhou: number;
  sessoesTotal: number;
}

export interface MusiDashboardResult {
  performance: any[];
  prepareMusiEvolutionData: any[];
  prepareMusiAttentionActivities: any[];
  prepareMusiAutonomyByCategory: any[];
  calculateAverageAndTrend: CalculateAverageAndTrend;
  kpis: MusiKpis;
}

export const emptyMusiDashboardResult: MusiDashboardResult = {
  performance: [],
  prepareMusiEvolutionData: [],
  prepareMusiAttentionActivities: [],
  prepareMusiAutonomyByCategory: [],
  calculateAverageAndTrend: {
    participation: {
      media: 0,
      tendencia: 0,
      totalRegistros: 0,
    },
    support: {
      media: 0,
      tendencia: 0,
      totalRegistros: 0,
    },
  },
  kpis: {
    atividadesTotal: 0,
    avgParticipacao: 0,
    avgSuporte: 0,
    desempenhou: 0,
    desempenhouComAjuda: 0,
    naoDesempenhou: 0,
    sessoesTotal: 0,
  },
};