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
};

export type AttentionStimuliResponse = {
  items: AttentionStimulusItem[];
  total: number;
  hasSufficientData: boolean; // Se tem tentativas suficientes (>= 5)
};
