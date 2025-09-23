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

