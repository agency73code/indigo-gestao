// ============================================================================
// MOCK DATA - TERAPEUTA (Minhas Horas)
// ============================================================================
// 25 lançamentos determinísticos para o terapeuta logado (ID: t-001)
// Distribuídos entre Out/Set/Ago 2025
// Status: submitted, approved, rejected, paid
// ============================================================================

import { subMonths, format } from 'date-fns';
import type {
    HourEntryDTO,
    CreateHourEntryInput,
    ListHourEntriesQuery,
    PagedResult,
    UpdateHourEntryInput,
    HourEntryStatus,
} from '../../types/hourEntry.types';

// ============================================================================
// BASE DE DADOS EM MEMÓRIA
// ============================================================================

let mockEntries: HourEntryDTO[] = [
    {
        id: 'm-001',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-001',
        patientName: 'João Silva',
        date: format(new Date(2025, 9, 2), 'yyyy-MM-dd'), // Out 2025
        startTime: '09:00',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1,
        notes: 'Sessão regular - paciente apresentou melhora significativa.',
        status: 'submitted' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 2, 18, 0).toISOString(),
        createdAt: new Date(2025, 9, 2, 9, 30).toISOString(),
        updatedAt: new Date(2025, 9, 2, 18, 0).toISOString(),
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
        notes: 'Primeira sessão do novo ciclo - estabelecimento de metas.',
        status: 'paid' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 5, 17, 0).toISOString(),
        approvedAt: new Date(2025, 9, 6, 9, 0).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: new Date(2025, 9, 5, 11, 0).toISOString(),
        updatedAt: new Date(2025, 9, 10, 14, 0).toISOString(),
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
    },
    {
        id: 'm-005',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-004',
        patientName: 'Ana Costa',
        date: format(new Date(2025, 9, 12), 'yyyy-MM-dd'),
        startTime: '15:00',
        durationMinutes: 120,
        hasTravel: false,
        notes: 'Sessão intensiva - trabalho em grupo familiar.',
        status: 'submitted' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 12, 20, 0).toISOString(),
        createdAt: new Date(2025, 9, 12, 17, 0).toISOString(),
        updatedAt: new Date(2025, 9, 12, 20, 0).toISOString(),
    },
    {
        id: 'm-006',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-002',
        patientName: 'Maria Santos',
        date: format(new Date(2025, 9, 16), 'yyyy-MM-dd'),
        startTime: '14:00',
        durationMinutes: 60,
        hasTravel: false,
        notes: 'Continuidade do plano terapêutico.',
        status: 'approved' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 16, 18, 0).toISOString(),
        approvedAt: new Date(2025, 9, 17, 10, 0).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: new Date(2025, 9, 16, 14, 30).toISOString(),
        updatedAt: new Date(2025, 9, 17, 10, 0).toISOString(),
    },
    // Setembro
    {
        id: 'm-007',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-003',
        patientName: 'Carlos Oliveira',
        date: format(subMonths(new Date(2025, 9, 1), 1), 'yyyy-MM-dd'), // Set
        startTime: '10:30',
        durationMinutes: 90,
        hasTravel: true,
        travelHours: 1.5,
        notes: 'Revisão de estratégias terapêuticas.',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 2), 1).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 3), 1).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 1), 1).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 10), 1).toISOString(),
    },
    {
        id: 'm-008',
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
    },
    {
        id: 'm-009',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-004',
        patientName: 'Ana Costa',
        date: format(subMonths(new Date(2025, 9, 10), 1), 'yyyy-MM-dd'),
        startTime: '15:00',
        durationMinutes: 60,
        hasTravel: false,
        notes: 'Sessão de acompanhamento.',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 10), 1).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 11), 1).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 10), 1).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 20), 1).toISOString(),
    },
    {
        id: 'm-010',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-002',
        patientName: 'Maria Santos',
        date: format(subMonths(new Date(2025, 9, 15), 1), 'yyyy-MM-dd'),
        startTime: '14:00',
        durationMinutes: 90,
        hasTravel: false,
        notes: 'Avaliação trimestral completa.',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 15), 1).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 16), 1).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 15), 1).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 25), 1).toISOString(),
    },
    // Agosto
    {
        id: 'm-011',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-003',
        patientName: 'Carlos Oliveira',
        date: format(subMonths(new Date(2025, 9, 1), 2), 'yyyy-MM-dd'), // Ago
        startTime: '10:30',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1.5,
        notes: '',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 2), 2).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 3), 2).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 1), 2).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 10), 2).toISOString(),
    },
    {
        id: 'm-012',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-001',
        patientName: 'João Silva',
        date: format(subMonths(new Date(2025, 9, 7), 2), 'yyyy-MM-dd'),
        startTime: '09:00',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1,
        notes: 'Sessão produtiva.',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 7), 2).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 8), 2).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 7), 2).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 15), 2).toISOString(),
    },
    {
        id: 'm-013',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-004',
        patientName: 'Ana Costa',
        date: format(subMonths(new Date(2025, 9, 12), 2), 'yyyy-MM-dd'),
        startTime: '15:00',
        durationMinutes: 120,
        hasTravel: false,
        notes: 'Sessão em grupo familiar - progresso notável.',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 12), 2).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 13), 2).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 12), 2).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 20), 2).toISOString(),
    },
    {
        id: 'm-014',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-002',
        patientName: 'Maria Santos',
        date: format(subMonths(new Date(2025, 9, 18), 2), 'yyyy-MM-dd'),
        startTime: '14:00',
        durationMinutes: 60,
        hasTravel: false,
        notes: '',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 18), 2).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 19), 2).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 18), 2).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 25), 2).toISOString(),
    },
    {
        id: 'm-015',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-003',
        patientName: 'Carlos Oliveira',
        date: format(subMonths(new Date(2025, 9, 25), 2), 'yyyy-MM-dd'),
        startTime: '10:30',
        durationMinutes: 90,
        hasTravel: true,
        travelHours: 1.5,
        notes: 'Encerramento do ciclo com resultados positivos.',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 25), 2).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 26), 2).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 25), 2).toISOString(),
        updatedAt: subMonths(new Date(2025, 10, 5), 2).toISOString(),
    },
    // Mais 10 entradas para totalizar 25
    {
        id: 'm-016',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-001',
        patientName: 'João Silva',
        date: format(new Date(2025, 9, 19), 'yyyy-MM-dd'),
        startTime: '09:00',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1,
        notes: '',
        status: 'approved' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 19, 18, 0).toISOString(),
        approvedAt: new Date(2025, 9, 20, 10, 0).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: new Date(2025, 9, 19, 9, 30).toISOString(),
        updatedAt: new Date(2025, 9, 20, 10, 0).toISOString(),
    },
    {
        id: 'm-017',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-002',
        patientName: 'Maria Santos',
        date: format(new Date(2025, 9, 23), 'yyyy-MM-dd'),
        startTime: '14:00',
        durationMinutes: 90,
        hasTravel: false,
        notes: 'Sessão de revisão mensal.',
        status: 'submitted' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 23, 19, 0).toISOString(),
        createdAt: new Date(2025, 9, 23, 15, 30).toISOString(),
        updatedAt: new Date(2025, 9, 23, 19, 0).toISOString(),
    },
    {
        id: 'm-018',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-004',
        patientName: 'Ana Costa',
        date: format(new Date(2025, 9, 26), 'yyyy-MM-dd'),
        startTime: '15:00',
        durationMinutes: 60,
        hasTravel: false,
        notes: '',
        status: 'submitted' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 26, 20, 0).toISOString(),
        createdAt: new Date(2025, 9, 26, 15, 30).toISOString(),
        updatedAt: new Date(2025, 9, 26, 20, 0).toISOString(),
    },
    {
        id: 'm-019',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-003',
        patientName: 'Carlos Oliveira',
        date: format(subMonths(new Date(2025, 9, 20), 1), 'yyyy-MM-dd'),
        startTime: '10:30',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1.5,
        notes: 'Sessão de acompanhamento pós-intervenção.',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 20), 1).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 21), 1).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 20), 1).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 28), 1).toISOString(),
    },
    {
        id: 'm-020',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-001',
        patientName: 'João Silva',
        date: format(subMonths(new Date(2025, 9, 25), 1), 'yyyy-MM-dd'),
        startTime: '09:00',
        durationMinutes: 90,
        hasTravel: true,
        travelHours: 1,
        notes: 'Sessão avançada - novos desafios.',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 25), 1).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 26), 1).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 25), 1).toISOString(),
        updatedAt: subMonths(new Date(2025, 10, 5), 1).toISOString(),
    },
    {
        id: 'm-021',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-002',
        patientName: 'Maria Santos',
        date: format(subMonths(new Date(2025, 9, 28), 1), 'yyyy-MM-dd'),
        startTime: '14:00',
        durationMinutes: 60,
        hasTravel: false,
        notes: '',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 28), 1).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 29), 1).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 28), 1).toISOString(),
        updatedAt: subMonths(new Date(2025, 10, 8), 1).toISOString(),
    },
    {
        id: 'm-022',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-004',
        patientName: 'Ana Costa',
        date: format(subMonths(new Date(2025, 9, 20), 2), 'yyyy-MM-dd'),
        startTime: '15:00',
        durationMinutes: 120,
        hasTravel: false,
        notes: 'Workshop familiar - excelente participação.',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 20), 2).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 21), 2).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 20), 2).toISOString(),
        updatedAt: subMonths(new Date(2025, 9, 28), 2).toISOString(),
    },
    {
        id: 'm-023',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-003',
        patientName: 'Carlos Oliveira',
        date: format(subMonths(new Date(2025, 9, 27), 2), 'yyyy-MM-dd'),
        startTime: '10:30',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1.5,
        notes: '',
        status: 'paid' as HourEntryStatus,
        submittedAt: subMonths(new Date(2025, 9, 27), 2).toISOString(),
        approvedAt: subMonths(new Date(2025, 9, 28), 2).toISOString(),
        approvedBy: 'Gerente Principal',
        createdAt: subMonths(new Date(2025, 9, 27), 2).toISOString(),
        updatedAt: subMonths(new Date(2025, 10, 5), 2).toISOString(),
    },
    {
        id: 'm-024',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-001',
        patientName: 'João Silva',
        date: format(new Date(2025, 9, 30), 'yyyy-MM-dd'),
        startTime: '09:00',
        durationMinutes: 60,
        hasTravel: true,
        travelHours: 1,
        notes: 'Última sessão do mês - planejamento para novembro.',
        status: 'submitted' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 30, 18, 0).toISOString(),
        createdAt: new Date(2025, 9, 30, 9, 30).toISOString(),
        updatedAt: new Date(2025, 9, 30, 18, 0).toISOString(),
    },
    {
        id: 'm-025',
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: 'p-002',
        patientName: 'Maria Santos',
        date: format(new Date(2025, 9, 30), 'yyyy-MM-dd'),
        startTime: '14:00',
        durationMinutes: 90,
        hasTravel: false,
        notes: 'Fechamento mensal com avaliação de metas.',
        status: 'submitted' as HourEntryStatus,
        submittedAt: new Date(2025, 9, 30, 19, 0).toISOString(),
        createdAt: new Date(2025, 9, 30, 15, 30).toISOString(),
        updatedAt: new Date(2025, 9, 30, 19, 0).toISOString(),
    },
];

let nextId = 26;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function applyFilters(entries: HourEntryDTO[], query: ListHourEntriesQuery): HourEntryDTO[] {
    let result = [...entries];

    if (query.from) {
        result = result.filter((e) => e.date >= query.from!);
    }

    if (query.to) {
        result = result.filter((e) => e.date <= query.to!);
    }

    if (query.patientId) {
        result = result.filter((e) => e.patientId === query.patientId);
    }

    if (query.status) {
        result = result.filter((e) => e.status === query.status);
    }

    // Ordenar por data DESC
    result.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return (b.startTime || '').localeCompare(a.startTime || '');
    });

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

// ============================================================================
// MOCK API
// ============================================================================

export async function listMine(query: ListHourEntriesQuery = {}): Promise<PagedResult<HourEntryDTO>> {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simular latência

    const filtered = applyFilters(mockEntries, query);
    return paginate(filtered, query.page, query.pageSize);
}

export async function create(input: CreateHourEntryInput): Promise<HourEntryDTO> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newEntry: HourEntryDTO = {
        id: `m-${String(nextId++).padStart(3, '0')}`,
        therapistId: 't-001',
        therapistName: 'Alice Ribeiro',
        patientId: input.patientId,
        patientName: input.patientName || 'Paciente',
        date: input.date,
        startTime: input.startTime,
        durationMinutes: input.durationMinutes,
        hasTravel: input.hasTravel,
        travelHours: input.travelHours,
        notes: input.notes,
        status: 'submitted', // Sempre submitted após criação
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    mockEntries.unshift(newEntry);
    return newEntry;
}

export async function submit(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const entry = mockEntries.find((e) => e.id === id);
    if (!entry) throw new Error('Lançamento não encontrado');

    entry.status = 'submitted';
    entry.submittedAt = new Date().toISOString();
    entry.updatedAt = new Date().toISOString();
}

export async function update(id: string, input: UpdateHourEntryInput): Promise<HourEntryDTO> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const entry = mockEntries.find((e) => e.id === id);
    if (!entry) throw new Error('Lançamento não encontrado');

    Object.assign(entry, input, { updatedAt: new Date().toISOString() });
    return entry;
}

export async function getById(id: string): Promise<HourEntryDTO> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const entry = mockEntries.find((e) => e.id === id);
    if (!entry) throw new Error('Lançamento não encontrado');

    return entry;
}

export async function remove(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    mockEntries = mockEntries.filter((e) => e.id !== id);
}
