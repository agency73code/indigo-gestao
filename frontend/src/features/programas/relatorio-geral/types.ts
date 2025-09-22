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

export type LinhaBarras = { 
  sessao: string; 
  acerto: number; 
  ajuda: number; 
  erro: number; 
};

export type HeatmapRow = { 
  estimulo: string; 
  valores: ('acerto'|'ajuda'|'erro'|null)[]; 
};

export type SparkItem = { 
  estimulo: string; 
  serie: { x: number; y: number }[]; 
  status: 'manutencao'|'aprendizagem'|'dominar'; 
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
};

export type HeatmapData = {
  sessoes: string[];
  linhas: HeatmapRow[];
};