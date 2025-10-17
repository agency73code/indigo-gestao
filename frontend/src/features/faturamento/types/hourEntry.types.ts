// ============================================================================
// TYPES CONSOLIDADOS DA FEATURE FATURAMENTO
// ============================================================================
// Este arquivo contém todos os types usados pelos módulos:
// - Registrar Lançamento (terapeuta)
// - Minhas Horas (terapeuta)
// - Gestão (gerente)
// ============================================================================

// ----------------------------------------------------------------------------
// STATUS E ENUMS
// ----------------------------------------------------------------------------

export type HourEntryStatus = 'submitted' | 'approved' | 'rejected' | 'paid';

export type ReceiptType = 'NOTA_FISCAL' | 'RECIBO_PF' | 'RECIBO_PJ';

// ----------------------------------------------------------------------------
// DTOs BÁSICOS (TERAPEUTA)
// ----------------------------------------------------------------------------

export type HourEntryDTO = {
    id: string;
    therapistId: string;
    therapistName?: string; // Nome do terapeuta (opcional na view do terapeuta, obrigatório na view da gerente)
    patientId: string;
    patientName: string; // Para exibição na listagem (obrigatório)
    date: string; // YYYY-MM-DD
    startTime?: string; // HH:mm (opcional)
    durationMinutes: 30 | 60 | 90 | 120;
    hasTravel: boolean;
    travelHours?: number; // Horas de deslocamento
    notes?: string;
    status: HourEntryStatus;
    submittedAt?: string; // ISO
    approvedAt?: string; // ISO
    approvedBy?: string;
    rejectedAt?: string; // ISO
    rejectedBy?: string;
    rejectionReason?: string;
    createdAt: string; // ISO
    updatedAt: string; // ISO
};

export type CreateHourEntryInput = {
    patientId: string;
    patientName: string; // Nome do paciente para exibição
    date: string;
    startTime?: string;
    durationMinutes: 30 | 60 | 90 | 120;
    hasTravel: boolean;
    travelHours?: number;
    notes?: string;
    // therapistId é inferido do usuário logado no backend
};

export type UpdateHourEntryInput = Partial<Omit<CreateHourEntryInput, 'patientId' | 'date'>>;

// ----------------------------------------------------------------------------
// DTOs DA GERENTE (COM VALORES)
// ----------------------------------------------------------------------------

/** Terapeuta visível para a gerente (com valor hora) */
export type TherapistDTO = {
    id: string;
    name: string;
    valorHora: number; // manager-only
};

/** Lançamento com valores (manager-only) */
export type ManagerEntryDTO = HourEntryDTO & {
    therapistName: string; // obrigatório para listar
    payableHours: number; // ceil(duration/60)
    valorHora: number; // do terapeuta
    payableAmount: number; // payableHours * valorHora
    payment?: {
        paidAt?: string; // data de pagamento
        receiptType?: ReceiptType;
        receiptNumber?: string;
    };
};

/** Linha agregada por terapeuta em Visão Geral */
export type TherapistPayrollSummaryDTO = {
    therapistId: string;
    therapistName: string;
    valorHora: number;
    sessionsCount: number;
    daysWorked: number; // datas distintas
    hoursRaw: number; // soma de durationMinutes/60 (sem arredondar)
    hoursPayable: number; // soma de ceil(duration/60) por lançamento
    totalAmount: number; // hoursPayable * valorHora
    lastEntryAt: string; // ISO
    statusCount: {
        submitted: number;
        approved: number;
        rejected: number;
        paid: number;
    };
};

// ----------------------------------------------------------------------------
// QUERY TYPES (FILTROS)
// ----------------------------------------------------------------------------

export type ListHourEntriesQuery = {
    from?: string; // YYYY-MM-DD
    to?: string; // YYYY-MM-DD
    patientId?: string;
    patientName?: string; // Usado internamente para filtro no mock
    status?: HourEntryStatus; // se vazio, retorna todos os status
    page?: number; // default 1
    pageSize?: number; // default 10
};

export type ManagerFilters = {
    from?: string;
    to?: string;
    therapistIds?: string[];
    patientId?: string;
    status?: HourEntryStatus;
    page?: number;
    pageSize?: number;
    sort?: 'date_desc' | 'date_asc' | 'date-desc' | 'date-asc' | 'therapist_asc' | 'therapist_desc' | 'amount-desc' | 'amount-asc';
};

// ----------------------------------------------------------------------------
// PAYLOADS DE AÇÕES (GERENTE)
// ----------------------------------------------------------------------------

export type ApproveRejectPayload = {
    entryIds: string[];
    reason?: string;
};

export type MarkPaidPayload = {
    entryIds: string[];
    paidAt: string;
    receiptType: ReceiptType;
    receiptNumber?: string;
};

// ----------------------------------------------------------------------------
// RESULT TYPES
// ----------------------------------------------------------------------------

export type PagedResult<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
};

// ----------------------------------------------------------------------------
// CONSTANTES
// ----------------------------------------------------------------------------

// Constantes de duração
export const DURATION_OPTIONS = [
    { value: 30, label: '30 min' },
    { value: 60, label: '60 min' },
    { value: 90, label: '90 min' },
    { value: 120, label: '120 min' },
] as const;

// Labels de status
export const STATUS_LABELS: Record<HourEntryStatus, string> = {
    submitted: 'Enviado',
    approved: 'Aprovado',
    rejected: 'Reprovado',
    paid: 'Pago',
};

// Cores de status para badges
export const STATUS_COLORS: Record<HourEntryStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-purple-100 text-purple-800',
};

// Labels de tipo de comprovante
export const RECEIPT_TYPE_LABELS: Record<ReceiptType, string> = {
    NOTA_FISCAL: 'Nota Fiscal',
    RECIBO_PF: 'Recibo PF',
    RECIBO_PJ: 'Recibo PJ',
};

