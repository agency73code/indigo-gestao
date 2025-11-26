// IMPORTS: tipos centrais do projeto
import type { Paciente, Terapeuta } from '../cadastros/types/cadastros.types';
import type { AreaType } from '@/contexts/AreaContext';

// Derivar IDs seguros
export type PatientId = NonNullable<Paciente['id']>;
export type TherapistId = NonNullable<Terapeuta['id']>;
export type ReportId = string;

// ISO date string
export type IsoDate = string; // 'YYYY-MM-DD'
export type IsoDateTime = string; // 'YYYY-MM-DDTHH:mm:ss.sssZ'

// Status do relatório
export type ReportStatus = 'final' | 'archived';

// Tipos de relatório
export type ReportType = 
  | 'mensal'          // Relatório mensal
  | 'trimestral'      // Relatório trimestral
  | 'semestral'       // Relatório semestral
  | 'anual'           // Relatório anual
  | 'custom';         // Período customizado

// Período do relatório
export interface ReportPeriod {
  mode: '30d' | '90d' | '180d' | '365d' | 'custom';
  start: IsoDate;
  end: IsoDate;
}

// Filtros aplicados na geração do relatório
export interface ReportFiltersApplied {
  pacienteId?: PatientId;
  periodo: ReportPeriod;
  programaId?: string;
  estimuloId?: string;
  terapeutaId?: TherapistId;
  objetivoLongoPrazo?: string;
  comparar?: boolean;
}

// KPIs do relatório (vindos do backend)
export interface ReportKpis {
  acerto: number;          // %
  independencia: number;   // %
  tentativas: number;
  sessoes: number;
  assiduidade?: number;    // %
  gapIndependencia?: number; // acerto - independencia
}

// Série temporal para gráfico de linha
export interface ReportSerieLinha {
  x: string;               // Data ou label
  acerto: number;
  independencia: number;
}

// Prazo do programa
export interface ReportPrazoPrograma {
  percent: number;
  label: string;
  inicio?: IsoDate;
  fim?: IsoDate;
}

// Dados gerados do relatório (vem do backend)
export interface ReportGeneratedData {
  kpis: ReportKpis;
  graphic: ReportSerieLinha[];
  programDeadline?: ReportPrazoPrograma;
  // Outros dados que o backend retornar
  [key: string]: any;
}

// Relatório salvo completo
export interface SavedReport {
  id: ReportId;
  title: string;                        // "Relatório Mensal - Janeiro 2025"
  type: ReportType;
  
  // Contexto principal
  patientId: PatientId;
  therapistId: TherapistId;
  area: AreaType;                       // 🆕 Área terapêutica do relatório
  
  // Datas
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  periodStart: IsoDate;                 // Início do período analisado
  periodEnd: IsoDate;                   // Fim do período analisado
  
  // Filtros usados na geração
  filters: ReportFiltersApplied;
  
  // Conteúdo do relatório
  clinicalObservations?: string;        // Observações clínicas do terapeuta
  generatedData: ReportGeneratedData;   // Dados gerados pelo backend
  
  // Metadados
  pdfUrl?: string;                      // URL do PDF gerado (se existir)
  pdfFilename?: string;                 // Nome do arquivo PDF
  status: ReportStatus;
  
  // Relacionamentos (populados ao buscar)
  patient?: Paciente;
  therapist?: Terapeuta;
}

// Input para criar novo relatório
export interface CreateReportInput {
  title: string;
  type: ReportType;
  patientId: PatientId;
  therapistId: TherapistId;
  area: AreaType;                       // 🆕 Área terapêutica do relatório
  periodStart: IsoDate;
  periodEnd: IsoDate;
  filters: ReportFiltersApplied;
  clinicalObservations?: string;
  generatedData: ReportGeneratedData;
  status?: ReportStatus;                // Padrão: 'draft'
}

// Input para atualizar relatório
export interface UpdateReportInput {
  id: ReportId;
  title?: string;
  clinicalObservations?: string;
  status?: ReportStatus;
  generatedData?: ReportGeneratedData;
}

// Filtros para busca/listagem de relatórios
export interface ReportListFilters {
  q?: string;                           // Busca por título, nome do cliente, terapeuta
  patientId?: PatientId;                // Filtrar por cliente
  therapistId?: TherapistId;            // Filtrar por terapeuta
  area?: AreaType;                      // 🆕 Filtrar por área terapêutica
  type?: ReportType | 'all';            // Filtrar por tipo
  status?: ReportStatus | 'all';        // Filtrar por status
  dateFrom?: IsoDate;                   // Data de criação de
  dateTo?: IsoDate;                     // Data de criação até
  periodFrom?: IsoDate;                 // Período analisado de
  periodTo?: IsoDate;                   // Período analisado até
  orderBy?: 'recent' | 'oldest' | 'alpha' | 'patient'; // Ordenação
  page?: number;
  pageSize?: number;
}

// Agrupamento de relatórios por cliente
export interface PatientWithReports {
  patient: Paciente;
  reports: SavedReport[];
  totalReports: number;
  latestReport?: SavedReport;
}

// Agrupamento de relatórios por terapeuta
export interface TherapistWithReports {
  therapist: Terapeuta;
  reports: SavedReport[];
  totalReports: number;
}

// Props dos componentes
export interface ReportListProps {
  reports: SavedReport[];
  patients: Paciente[];
  therapists: Terapeuta[];
  filters: ReportListFilters;
  loading?: boolean;
  onViewReport: (report: SavedReport) => void;
  onEditReport: (report: SavedReport) => void;
  onDeleteReport: (report: SavedReport) => void;
  onDownloadPdf: (report: SavedReport) => void;
  onArchiveReport: (report: SavedReport) => void;
}

export interface ReportCardProps {
  report: SavedReport;
  patient?: Paciente;
  therapist?: Terapeuta;
  onView: (report: SavedReport) => void;
  onEdit: (report: SavedReport) => void;
  onDelete: (report: SavedReport) => void;
  onDownloadPdf: (report: SavedReport) => void;
  onArchive: (report: SavedReport) => void;
}

export interface ReportFiltersProps {
  filters: ReportListFilters;
  onFiltersChange: (filters: ReportListFilters) => void;
  patients: Paciente[];
  therapists: Terapeuta[];
}

export interface ReportViewerProps {
  report: SavedReport;
  patient: Paciente;
  therapist: Terapeuta;
  onEdit: () => void;
  onDownloadPdf: () => void;
  onClose: () => void;
}

export interface DeleteReportDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  report: SavedReport | null;
  loading?: boolean;
}

export interface ArchiveReportDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  report: SavedReport | null;
  loading?: boolean;
}

// Re-export necessários
export type { Paciente, Terapeuta };
