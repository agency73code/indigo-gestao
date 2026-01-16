// =============================================================================
// Dashboard Types - Preparado para integração com backend
// =============================================================================

// -----------------------------------------------------------------------------
// Shared Types (usados por ambos os dashboards)
// -----------------------------------------------------------------------------

export interface SessoesPorArea {
  area: string;
  label: string;
  total: number;
  percentual: number;
  color: string;
}

export interface SessoesPorMes {
  mes: string;
  total: number;
}

export type PeriodoFiltro = '7d' | '30d' | '90d';

// -----------------------------------------------------------------------------
// Dashboard Terapeuta Types
// -----------------------------------------------------------------------------

export interface TerapeutaMetrics {
  meusPacientes: number;
  minhasSessoesEstaSemana: number;
  minhasSessoesEsteMes: number;
  meusProgramasAtivos: number;
}

export interface MeuCliente {
  id: string;
  nome: string;
  avatarUrl?: string;
  areaAtuacao: string;
  ultimaSessao: string | null;
}

export interface EvolucaoPerformance {
  semana: string;
  independencia: number;
  ajuda: number;
}

export interface AtividadeRecente {
  id: string;
  tipo: 'sessao' | 'anamnese' | 'relatorio' | 'programa';
  descricao: string;
  paciente: string;
  data: string;
}

export interface EstimuloAtencao {
  id: string;
  nome: string;
  paciente: string;
  taxaAcerto: number;
  totalTentativas: number;
  area: string;
}

export interface DashboardTerapeutaData {
  metrics: TerapeutaMetrics;
  sessoesPorMes: SessoesPorMes[];
  meusClientes: MeuCliente[];
  atividadesRecentes: AtividadeRecente[];
}

// -----------------------------------------------------------------------------
// Dashboard Gerente Types
// -----------------------------------------------------------------------------

export interface GerenteMetrics {
  totalPacientes: number;
  totalTerapeutas: number;
  sessoesClinicaSemana: number;
  sessoesClinicaMes: number;
  taxaIndependenciaClinica: number;
}

export interface EquipePerformance {
  mes: string;
  sessoes: number;
  independencia: number;
}

export interface TerapeutaRanking {
  id: string;
  nome: string;
  avatar?: string;
  sessoesMes: number;
  pacientesAtivos: number;
  taxaIndependencia: number;
}

export interface PacienteAtencao {
  id: string;
  nome: string;
  motivo: 'sem_sessao' | 'baixa_performance' | 'prazo_programa';
  descricao: string;
  ultimaAtualizacao: string;
}

export interface DashboardGerenteData {
  metrics: GerenteMetrics;
  sessoesPorArea: SessoesPorArea[];
  sessoesPorMes: SessoesPorMes[];
  equipePerformance: EquipePerformance[];
  terapeutasRanking: TerapeutaRanking[];
  pacientesAtencao: PacienteAtencao[];
}

// -----------------------------------------------------------------------------
// Legacy (mantido para compatibilidade temporária)
// -----------------------------------------------------------------------------

/** @deprecated Use DashboardTerapeutaData ou DashboardGerenteData */
export interface DashboardMetrics {
  clientesAtivos: number;
  sessoesEstaSemana: number;
  sessoesEsteMes: number;
  programasAtivos: number;
  terapeutasAtivos: number;
  taxaIndependencia: number;
}

/** @deprecated Use DashboardTerapeutaData ou DashboardGerenteData */
export interface DashboardData {
  metrics: DashboardMetrics;
  sessoesPorArea: SessoesPorArea[];
  sessoesPorMes: SessoesPorMes[];
  evolucaoPerformance: EvolucaoPerformance[];
  atividadesRecentes: AtividadeRecente[];
  estimulosAtencao: EstimuloAtencao[];
}
