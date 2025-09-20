export type RegistroTentativa = {
  tentativa: number;
  resultado: 'acerto' | 'erro' | 'ajuda';
  stimulusId?: string;
  stimulusLabel?: string;
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
  registros: RegistroTentativa[];
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
