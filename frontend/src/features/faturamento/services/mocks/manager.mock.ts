// ============================================================================
// MOCK DATA - GERENTE (Gestão de Horas)
// ============================================================================
// Dados determinísticos para visão gerencial com valores financeiros
// 3 Terapeutas com valorHora diferente
// Cálculo: payableHours = ceil(durationMinutes/60)
// ============================================================================

import { subMonths, format } from 'date-fns';
import type {
    ManagerEntryDTO,
    ManagerFilters,
    PagedResult,
    TherapistDTO,
    TherapistPayrollSummaryDTO,
    ApproveRejectPayload,
    MarkPaidPayload,
    HourEntryStatus,
    ReceiptType,
} from '../../types/hourEntry.types';

// ============================================================================
// TERAPEUTAS
// ============================================================================

const therapists: TherapistDTO[] = [
    { id: 't-001', name: 'Alice Ribeiro', valorHora: 150 },
    { id: 't-002', name: 'Carolina Mendes', valorHora: 120 },
    { id: 't-003', name: 'Bruno Costa', valorHora: 180 },
];

// ============================================================================
// BASE DE DADOS EM MEMÓRIA (MANAGER VIEW)
// ============================================================================

const mockManagerEntries: ManagerEntryDTO[] = [
    // Alice Ribeiro (t-001) - Outubro
    {
        id: 'm-001',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-001',
        patientName: 'João Silva',
        date: format(new Date(2025, 9, 2), 'yyyy-MM-dd'),
        startTime: '09:00',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1,
        notes: 'Sessão regular - paciente apresentou melhora significativa.',
        status: 'submitted' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 2, 18, 0).toISOString(),
        createdAt: new Date(2025, 9, 2, 9, 30).toISOString(),
        updatedAt: new Date(2025, 9, 2, 18, 0).toISOString(),
        // Campos gerenciais
        payableHours: Math.ceil(60 / 60), // 1
        valorHora: 150,
        payableAmount: Math.ceil(60 / 60) * 150, // 150
    },
    {
        id: 'm-002',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-002',
        patientName: 'Maria Santos',
        date: format(new Date(2025, 9, 2), 'yyyy-MM-dd'),
        startTime: '14:00',
        durationMinutes: 90,
        hasTravel: false,
        notes: 'Avaliação de progresso - resultados positivos.',
        status: 'approved' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 2, 19, 0).toISOString(),
        approvedAt: new Date(2025, 9, 3, 10, 0).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: new Date(2025, 9, 2, 14, 30).toISOString(),
        updatedAt: new Date(2025, 9, 3, 10, 0).toISOString(),
        payableHours: Math.ceil(90 / 60), // 2
        valorHora: 150,
        payableAmount: Math.ceil(90 / 60) * 150, // 300
    },
    {
        id: 'm-003',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-003',
        patientName: 'Carlos Oliveira',
        date: format(new Date(2025, 9, 5), 'yyyy-MM-dd'),
        startTime: '10:30',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1.5,
        notes: 'Primeira sessão do novo ciclo.',
        status: 'paid' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 5, 17, 0).toISOString(),
        approvedAt: new Date(2025, 9, 6, 9, 0).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: new Date(2025, 9, 5, 11, 0).toISOString(),
        updatedAt: new Date(2025, 9, 10, 14, 0).toISOString(),
        payableHours: Math.ceil(60 / 60), // 1
        valorHora: 150,
        payableAmount: Math.ceil(60 / 60) * 150, // 150
        payment: {
            paidAt: new Date(2025, 9, 10, 14, 0).toISOString(),
            receiptType: 'NOTA_FISCAL' as ReceiptType,
            receiptNumber: 'NF-2025-10001',
        },
    },
    {
        id: 'm-004',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-001',
        patientName: 'João Silva',
        date: format(new Date(2025, 9, 9), 'yyyy-MM-dd'),
        startTime: '09:00',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1,
        notes: '',
        status: 'rejected' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 9, 18, 0).toISOString(),
        rejectedAt: new Date(2025, 9, 10, 11, 0).toISOString(),
        rejectedBy: 'Gerente Principal',
        rejectionReason: 'Horário inconsistente com agendamento original.',
        createdAt: new Date(2025, 9, 9, 9, 30).toISOString(),
        updatedAt: new Date(2025, 9, 10, 11, 0).toISOString(),
        payableHours: Math.ceil(60 / 60), // 1
        valorHora: 150,
        payableAmount: 0, // Rejected = 0
    },
    // Carolina Mendes (t-002) - Outubro
    {
        id: 'm-005',
        therapistId: 't-002',
        therapistName: 'Carolina Mendes',
        patientId: 'p-004',
        patientName: 'Ana Costa',
        date: format(new Date(2025, 9, 3), 'yyyy-MM-dd'),
        startTime: '08:00',
        durationMinutes: 60,
        hasTravel: false,
        notes: 'Sessão inicial - levantamento de necessidades.',
        status: 'submitted' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 3, 17, 0).toISOString(),
        createdAt: new Date(2025, 9, 3, 8, 30).toISOString(),
        updatedAt: new Date(2025, 9, 3, 17, 0).toISOString(),
        payableHours: Math.ceil(60 / 60), // 1
        valorHora: 120,
        payableAmount: Math.ceil(60 / 60) * 120, // 120
    },
    {
        id: 'm-006',
        therapistId: 't-002',
        therapistName: 'Carolina Mendes',
        patientId: 'p-005',
        patientName: 'Pedro Almeida',
        date: format(new Date(2025, 9, 7), 'yyyy-MM-dd'),
        startTime: '11:00',
        durationMinutes: 120,
        hasTravel: true,
        travelHours: 2,
        notes: 'Sessão intensiva em grupo.',
        status: 'approved' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 7, 18, 0).toISOString(),
        approvedAt: new Date(2025, 9, 8, 9, 0).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: new Date(2025, 9, 7, 13, 0).toISOString(),
        updatedAt: new Date(2025, 9, 8, 9, 0).toISOString(),
        payableHours: Math.ceil(120 / 60), // 2
        valorHora: 120,
        payableAmount: Math.ceil(120 / 60) * 120, // 240
    },
    {
        id: 'm-007',
        therapistId: 't-002',
        therapistName: 'Carolina Mendes',
        patientId: 'p-006',
        patientName: 'Juliana Rocha',
        date: format(new Date(2025, 9, 14), 'yyyy-MM-dd'),
        startTime: '14:00',
        durationMinutes: 90,
        hasTravel: false,
        notes: '',
        status: 'paid' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 14, 19, 0).toISOString(),
        approvedAt: new Date(2025, 9, 15, 10, 0).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: new Date(2025, 9, 14, 15, 30).toISOString(),
        updatedAt: new Date(2025, 9, 20, 16, 0).toISOString(),
        payableHours: Math.ceil(90 / 60), // 2
        valorHora: 120,
        payableAmount: Math.ceil(90 / 60) * 120, // 240
        payment: {
            paidAt: new Date(2025, 9, 20, 16, 0).toISOString(),
            receiptType: 'RECIBO_PF' as ReceiptType,
            receiptNumber: 'REC-2025-001',
        },
    },
    // Bruno Costa (t-003) - Outubro
    {
        id: 'm-008',
        therapistId: 't-003',
        therapistName: 'Bruno Costa',
        patientId: 'p-007',
        patientName: 'Rafael Lima',
        date: format(new Date(2025, 9, 4), 'yyyy-MM-dd'),
        startTime: '16:00',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1,
        notes: 'Atendimento domiciliar - adaptação de rotina.',
        status: 'submitted' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 4, 20, 0).toISOString(),
        createdAt: new Date(2025, 9, 4, 17, 0).toISOString(),
        updatedAt: new Date(2025, 9, 4, 20, 0).toISOString(),
        payableHours: Math.ceil(60 / 60), // 1
        valorHora: 180,
        payableAmount: Math.ceil(60 / 60) * 180, // 180
    },
    {
        id: 'm-009',
        therapistId: 't-003',
        therapistName: 'Bruno Costa',
        patientId: 'p-008',
        patientName: 'Beatriz Souza',
        date: format(new Date(2025, 9, 10), 'yyyy-MM-dd'),
        startTime: '10:00',
        durationMinutes: 90,
        hasTravel: false,
        notes: 'Avaliação comportamental completa.',
        status: 'approved' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 10, 18, 0).toISOString(),
        approvedAt: new Date(2025, 9, 11, 9, 0).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: new Date(2025, 9, 10, 11, 30).toISOString(),
        updatedAt: new Date(2025, 9, 11, 9, 0).toISOString(),
        payableHours: Math.ceil(90 / 60), // 2
        valorHora: 180,
        payableAmount: Math.ceil(90 / 60) * 180, // 360
    },
    {
        id: 'm-010',
        therapistId: 't-003',
        therapistName: 'Bruno Costa',
        patientId: 'p-007',
        patientName: 'Rafael Lima',
        date: format(new Date(2025, 9, 18), 'yyyy-MM-dd'),
        startTime: '16:00',
        durationMinutes: 120,
        hasTravel: true,
        travelHours: 1,
        notes: 'Sessão estendida - intervenção intensiva.',
        status: 'paid' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 18, 21, 0).toISOString(),
        approvedAt: new Date(2025, 9, 19, 10, 0).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: new Date(2025, 9, 18, 18, 0).toISOString(),
        updatedAt: new Date(2025, 9, 25, 15, 0).toISOString(),
        payableHours: Math.ceil(120 / 60), // 2
        valorHora: 180,
        payableAmount: Math.ceil(120 / 60) * 180, // 360
        payment: {
            paidAt: new Date(2025, 9, 25, 15, 0).toISOString(),
            receiptType: 'RECIBO_PJ' as ReceiptType,
            receiptNumber: 'CNPJ-2025-042',
        },
    },
    // Mais entradas de setembro (paid)
    {
        id: 'm-011',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-001',
        patientName: 'João Silva',
        date: format(subMonths(new Date(2025, 9, 5), 1), 'yyyy-MM-dd'),
        startTime: '09:00',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1,
        notes: '',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 5), 1).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 6), 1).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 5), 1).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 15), 1).toISOString(),
        payableHours: 1,
        valorHora: 150,
        payableAmount: 150,
        payment: {
            paidAt: subMonths(new Date(2025, 9, 15), 1).toISOString(),
            receiptType: 'NOTA_FISCAL',
            receiptNumber: 'NF-2025-09001',
        },
    },
    {
        id: 'm-012',
        therapistId: 't-002',
        therapistName: 'Carolina Mendes',
        patientId: 'p-004',
        patientName: 'Ana Costa',
        date: format(subMonths(new Date(2025, 9, 10), 1), 'yyyy-MM-dd'),
        startTime: '08:00',
        durationMinutes: 90,
        hasTravel: false,
        notes: 'Sessão de follow-up.',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 10), 1).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 11), 1).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 10), 1).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 20), 1).toISOString(),
        payableHours: 2,
        valorHora: 120,
        payableAmount: 240,
        payment: {
            paidAt: subMonths(new Date(2025, 9, 20), 1).toISOString(),
            receiptType: 'RECIBO_PF',
            receiptNumber: 'REC-2025-002',
        },
    },
];


// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function applyManagerFilters(entries: ManagerEntryDTO[], filters: ManagerFilters): ManagerEntryDTO[] {
    let result = [...entries];

    if (filters.from) {
        result = result.filter((e) => e.date >= filters.from!);
    }

    if (filters.to) {
        result = result.filter((e) => e.date <= filters.to!);
    }

    if (filters.therapistIds && filters.therapistIds.length > 0) {
        result = result.filter((e) => filters.therapistIds!.includes(e.therapistId));
    }

    if (filters.patientId) {
        result = result.filter((e) => e.patientId === filters.patientId);
    }

    if (filters.status) {
        result = result.filter((e) => e.status === filters.status);
    }

    // Ordenação
    const sort = filters.sort || 'date-desc';
    if (sort === 'date-asc') {
        result.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sort === 'date-desc') {
        result.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sort === 'amount-desc') {
        result.sort((a, b) => b.payableAmount - a.payableAmount);
    } else if (sort === 'amount-asc') {
        result.sort((a, b) => a.payableAmount - b.payableAmount);
    }

    return result;
}

function paginate<T>(items: T[], page = 1, pageSize = 10): PagedResult<T> {
    const total = items.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
        items: items.slice(start, end),
        page,
        pageSize,
        total,
    };
}

function calculatePayrollSummary(entries: ManagerEntryDTO[]): TherapistPayrollSummaryDTO[] {
    type SummaryWithSet = Omit<TherapistPayrollSummaryDTO, 'daysWorked'> & { daysWorked: Set<string> };
    
    const grouped = entries.reduce(
        (acc, entry) => {
            if (!acc[entry.therapistId]) {
                const therapist = therapists.find((t) => t.id === entry.therapistId)!;
                acc[entry.therapistId] = {
                    therapistId: entry.therapistId,
                    therapistName: entry.therapistName,
                    valorHora: therapist.valorHora,
                    sessionsCount: 0,
                    daysWorked: new Set<string>(),
                    hoursRaw: 0,
                    hoursPayable: 0,
                    totalAmount: 0,
                    lastEntryAt: entry.date,
                    statusCount: { submitted: 0, approved: 0, rejected: 0, paid: 0 },
                };
            }

            const summary = acc[entry.therapistId];
            summary.sessionsCount++;
            summary.daysWorked.add(entry.date);
            summary.hoursRaw += entry.durationMinutes / 60;
            summary.hoursPayable += entry.payableHours;
            summary.statusCount[entry.status]++;

            if (entry.status !== 'rejected') {
                summary.totalAmount += entry.payableAmount;
            }

            if (entry.date > summary.lastEntryAt) {
                summary.lastEntryAt = entry.date;
            }

            return acc;
        },
        {} as Record<string, SummaryWithSet>,
    );

    return Object.values(grouped).map((summary) => ({
        ...summary,
        daysWorked: summary.daysWorked.size,
    }));
}

// ============================================================================
// MOCK API - GERENTE
// ============================================================================

export async function listTherapists(): Promise<TherapistDTO[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...therapists];
}

export async function listOverviewByTherapist(
    filters: ManagerFilters,
): Promise<PagedResult<TherapistPayrollSummaryDTO>> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const filtered = applyManagerFilters(mockManagerEntries, filters);
    const summaries = calculatePayrollSummary(filtered);

    return paginate(summaries, filters.page, filters.pageSize);
}

export async function listApprovalsQueue(filters: ManagerFilters): Promise<PagedResult<ManagerEntryDTO>> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const submittedEntries = mockManagerEntries.filter((e) => e.status === 'submitted');
    const filtered = applyManagerFilters(submittedEntries, filters);

    return paginate(filtered, filters.page, filters.pageSize);
}

export async function listEntriesByTherapist(
    therapistId: string,
    filters: ManagerFilters,
): Promise<PagedResult<ManagerEntryDTO>> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const therapistEntries = mockManagerEntries.filter((e) => e.therapistId === therapistId);
    const filtered = applyManagerFilters(therapistEntries, { ...filters, therapistIds: undefined });

    return paginate(filtered, filters.page, filters.pageSize);
}

export async function approve(payload: ApproveRejectPayload): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    payload.entryIds.forEach((id) => {
        const entry = mockManagerEntries.find((e) => e.id === id);
        if (entry && entry.status === 'submitted') {
            entry.status = 'approved';
            entry.approvedAt = new Date().toISOString();
            entry.approvedBy = 'Gerente Principal';
            entry.updatedAt = new Date().toISOString();
        }
    });
}

export async function reject(payload: ApproveRejectPayload): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    payload.entryIds.forEach((id) => {
        const entry = mockManagerEntries.find((e) => e.id === id);
        if (entry && entry.status === 'submitted') {
            entry.status = 'rejected';
            entry.rejectedAt = new Date().toISOString();
            entry.rejectedBy = 'Gerente Principal';
            entry.rejectionReason = payload.reason || 'Rejeitado pela gerência.';
            entry.payableAmount = 0; // Rejected = sem pagamento
            entry.updatedAt = new Date().toISOString();
        }
    });
}

export async function markPaid(payload: MarkPaidPayload): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    payload.entryIds.forEach((id) => {
        const entry = mockManagerEntries.find((e) => e.id === id);
        if (entry && entry.status === 'approved') {
            entry.status = 'paid';
            entry.payment = {
                paidAt: payload.paidAt,
                receiptType: payload.receiptType,
                receiptNumber: payload.receiptNumber,
            };
            entry.updatedAt = new Date().toISOString();
        }
    });
}
