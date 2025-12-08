export type RegistroTentativa = {
  tentativa: number;
  resultado: 'acerto' | 'erro' | 'ajuda';
  stimulusId?: string;
  stimulusLabel?: string;
  durationMinutes?: number | null; // tempo em minutos (para TO)
  // Campos de Musicoterapia
  participacao?: number | null; // 0-5: 0=Não participa, 5=Supera expectativas
  suporte?: number | null; // 1-5: 1=Sem suporte, 5=Máximo físico
  // Metadata para Fisioterapia (pode vir como string JSON ou objeto)
  metadata?: string | {
    usedLoad?: boolean;
    loadValue?: string;
    hadDiscomfort?: boolean;
    discomfortDescription?: string;
    hadCompensation?: boolean;
    compensationDescription?: string;
  };
  // Campos diretos (para compatibilidade)
  usedLoad?: boolean;
  loadValue?: string;
  hadDiscomfort?: boolean;
  discomfortDescription?: string;
  hadCompensation?: boolean;
  compensationDescription?: string;
};

export type SessionFile = {
  id: string;
  name: string;
  fileName: string;
  type: string;
  size: number;
  url: string;
};

export type Sessao = {
  id: string;
  pacienteId: string;
  terapeutaId: string;
  terapeutaNome?: string;
  data: string; // ISO
  programa: string;
  objetivo: string;
  prazoInicio: string; // ISO
  prazoFim: string; // ISO
  observacoes?: string | null;
  files?: SessionFile[];
  registros: RegistroTentativa[];
  area: string; // 'fisioterapia' | 'terapia-ocupacional' | 'fonoaudiologia'
};

export type ResumoSessao = {
  acerto: number; // %
  independencia: number; // %
  tentativas: number;
};

export type SessaoFiltersState = {
  q: string;
  dateRange: 'all' | 'last7' | 'last30' | 'year';
  program: 'all' | string;
  therapist: 'all' | string;
  sort: 'date-desc' | 'date-asc' | 'accuracy-desc' | 'accuracy-asc';
};

// Reuse existing shared types
export type { Patient } from '@/features/programas/consultar-programas/types';
export type { ProgramDetail } from '@/features/programas/detalhe-ocp/types';
