// Types para lançamento de horas - VIEW DE TERAPEUTA
// Não exibe valores financeiros para terapeuta

export type HourEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export type HourEntryDTO = {
  id: string;
  therapistId: string;
  patientId: string;
  patientName?: string;     // Para exibição na listagem
  date: string;             // YYYY-MM-DD
  startTime?: string;       // HH:mm (opcional)
  durationMinutes: 30 | 60 | 90 | 120;
  hasTravel: boolean;
  notes?: string;
  status: HourEntryStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateHourEntryInput = {
  patientId: string;
  date: string;
  startTime?: string;
  durationMinutes: 30 | 60 | 90 | 120;
  hasTravel: boolean;
  notes?: string;
  // therapistId é inferido do usuário logado no backend
};

export type UpdateHourEntryInput = Partial<Omit<CreateHourEntryInput, 'patientId' | 'date'>> & {
  // Permitir ajustar duration, startTime, hasTravel, notes
  // Evitar mudar data/paciente após submissão
};

export type ListHourEntriesQuery = {
  from?: string;            // YYYY-MM-DD
  to?: string;              // YYYY-MM-DD
  patientId?: string;
  status?: HourEntryStatus | HourEntryStatus[] | 'all';
  page?: number;
  pageSize?: number;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// Constantes de duração
export const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '120 min' },
] as const;

// Labels de status
export const STATUS_LABELS: Record<HourEntryStatus, string> = {
  draft: 'Rascunho',
  submitted: 'Enviado',
  approved: 'Aprovado',
  rejected: 'Reprovado',
  paid: 'Pago',
};

// Cores de status para badges
export const STATUS_COLORS: Record<HourEntryStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  paid: 'bg-purple-100 text-purple-800',
};
