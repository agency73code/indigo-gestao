// ============================================================================
// SERVICE CONSOLIDADO DA FEATURE FATURAMENTO
// ============================================================================
// Este arquivo contém todos os services da feature, centralizando:
// - Lançamento de horas (terapeuta)
// - Gestão de horas (gerente)
// - Toggle automático entre API real e mocks via VITE_USE_MOCK
// ============================================================================

import type {
    CreateHourEntryInput,
    HourEntryDTO,
    ListHourEntriesQuery,
    ManagerEntryDTO,
    ManagerFilters,
    PagedResult,
    TherapistDTO,
    TherapistPayrollSummaryDTO,
    UpdateHourEntryInput,
    ApproveRejectPayload,
    MarkPaidPayload,
} from '../types/hourEntry.types';

// Importar mocks
import * as therapistMock from './mocks/therapist.mock.js';
import * as managerMock from './mocks/manager.mock.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === '1';

// ============================================================================
// SERVICES DO TERAPEUTA (Registrar Lançamento + Minhas Horas)
// ============================================================================

export const therapistService = {
    /**
     * Listar lançamentos do terapeuta logado
     */
    async listMine(query: ListHourEntriesQuery = {}): Promise<PagedResult<HourEntryDTO>> {
        if (USE_MOCK) return therapistMock.listMine(query);

        // TODO: Implementar chamada real à API
        const response = await fetch('/api/faturamento/therapist/entries', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Erro ao listar lançamentos');
        return response.json();
    },

    /**
     * Criar novo lançamento
     */
    async create(input: CreateHourEntryInput): Promise<HourEntryDTO> {
        if (USE_MOCK) return therapistMock.create(input);

        // TODO: Implementar chamada real à API
        const response = await fetch('/api/faturamento/therapist/entries', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        if (!response.ok) throw new Error('Erro ao criar lançamento');
        return response.json();
    },

    /**
     * Enviar lançamento para aprovação
     */
    async submit(id: string): Promise<void> {
        if (USE_MOCK) return therapistMock.submit(id);

        // TODO: Implementar chamada real à API
        const response = await fetch(`/api/faturamento/therapist/entries/${id}/submit`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Erro ao enviar lançamento');
    },

    /**
     * Atualizar lançamento
     */
    async update(id: string, input: UpdateHourEntryInput): Promise<HourEntryDTO> {
        if (USE_MOCK) return therapistMock.update(id, input);

        // TODO: Implementar chamada real à API
        const response = await fetch(`/api/faturamento/therapist/entries/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        if (!response.ok) throw new Error('Erro ao atualizar lançamento');
        return response.json();
    },

    /**
     * Buscar lançamento por ID
     */
    async getById(id: string): Promise<HourEntryDTO> {
        if (USE_MOCK) return therapistMock.getById(id);

        // TODO: Implementar chamada real à API
        const response = await fetch(`/api/faturamento/therapist/entries/${id}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Erro ao buscar lançamento');
        return response.json();
    },

    /**
     * Remover lançamento (desabilitado para terapeuta)
     */
    async remove(_id: string): Promise<void> {
        if (USE_MOCK) return therapistMock.remove(_id);
        throw new Error('Terapeuta não pode excluir lançamentos.');
    },
};

// ============================================================================
// SERVICES DA GERENTE (Gestão de Horas)
// ============================================================================

export const managerService = {
    /**
     * Listar terapeutas (para filtros)
     */
    async listTherapists(): Promise<TherapistDTO[]> {
        if (USE_MOCK) return managerMock.listTherapists();

        // TODO: Implementar chamada real à API
        const response = await fetch('/api/faturamento/manager/therapists', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Erro ao listar terapeutas');
        return response.json();
    },

    /**
     * Visão Geral: agregados por terapeuta
     */
    async listOverviewByTherapist(
        filters: ManagerFilters,
    ): Promise<PagedResult<TherapistPayrollSummaryDTO>> {
        if (USE_MOCK) return managerMock.listOverviewByTherapist(filters);

        // TODO: Implementar chamada real à API
        const params = new URLSearchParams(filters as Record<string, string>);
        const response = await fetch(`/api/faturamento/manager/overview?${params}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Erro ao buscar visão geral');
        return response.json();
    },

    /**
     * Fila de aprovações (lançamentos submitted)
     */
    async listApprovalsQueue(filters: ManagerFilters): Promise<PagedResult<ManagerEntryDTO>> {
        if (USE_MOCK) return managerMock.listApprovalsQueue(filters);

        // TODO: Implementar chamada real à API
        const params = new URLSearchParams(filters as Record<string, string>);
        const response = await fetch(`/api/faturamento/manager/approvals?${params}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Erro ao buscar fila de aprovações');
        return response.json();
    },

    /**
     * Detalhe por terapeuta (com valores)
     */
    async listEntriesByTherapist(
        therapistId: string,
        filters: ManagerFilters,
    ): Promise<PagedResult<ManagerEntryDTO>> {
        if (USE_MOCK) return managerMock.listEntriesByTherapist(therapistId, filters);

        // TODO: Implementar chamada real à API
        const params = new URLSearchParams(filters as Record<string, string>);
        const response = await fetch(
            `/api/faturamento/manager/therapists/${therapistId}/entries?${params}`,
            {
                method: 'GET',
                credentials: 'include',
            },
        );

        if (!response.ok) throw new Error('Erro ao buscar lançamentos do terapeuta');
        return response.json();
    },

    /**
     * Aprovar lançamentos
     */
    async approve(payload: ApproveRejectPayload): Promise<void> {
        if (USE_MOCK) return managerMock.approve(payload);

        // TODO: Implementar chamada real à API
        const response = await fetch('/api/faturamento/manager/approve', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Erro ao aprovar lançamentos');
    },

    /**
     * Reprovar lançamentos
     */
    async reject(payload: ApproveRejectPayload): Promise<void> {
        if (USE_MOCK) return managerMock.reject(payload);

        // TODO: Implementar chamada real à API
        const response = await fetch('/api/faturamento/manager/reject', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Erro ao reprovar lançamentos');
    },

    /**
     * Marcar como pago
     */
    async markPaid(payload: MarkPaidPayload): Promise<void> {
        if (USE_MOCK) return managerMock.markPaid(payload);

        // TODO: Implementar chamada real à API
        const response = await fetch('/api/faturamento/manager/mark-paid', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Erro ao marcar como pago');
    },
};
