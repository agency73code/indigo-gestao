import { authFetch } from '@/lib/http';
import type {
  CreateHourEntryInput,
  HourEntryDTO,
  ListHourEntriesQuery,
  PagedResult,
  UpdateHourEntryInput,
} from '../types/hourEntry.types';
import * as mock from './hourEntry.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === '1';
const BASE = '/api/faturamento/lancamentos';

// Debug log para verificar se o mock está ativo
console.log('🔧 [HourEntry Service] VITE_USE_MOCK:', import.meta.env.VITE_USE_MOCK);
console.log('🔧 [HourEntry Service] USE_MOCK:', USE_MOCK);

/**
 * Service unificado para lançamento de horas (terapeuta)
 * Alterna entre mock e API real via flag VITE_USE_MOCK
 */
export const hourEntryService = {
  /**
   * Cria um novo lançamento em rascunho
   */
  async create(payload: CreateHourEntryInput): Promise<HourEntryDTO> {
    if (USE_MOCK) return mock.create(payload);

    const res = await authFetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = data?.message ?? data?.error ?? `Falha ao criar lançamento (${res.status})`;
      throw new Error(msg);
    }

    return data as HourEntryDTO;
  },

  /**
   * Envia um lançamento para aprovação
   */
  async submit(id: string): Promise<void> {
    if (USE_MOCK) return mock.submit(id);

    const res = await authFetch(`${BASE}/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      const msg = data?.message ?? data?.error ?? `Falha ao enviar lançamento (${res.status})`;
      throw new Error(msg);
    }
  },

  /**
   * Atualiza um lançamento existente
   */
  async update(id: string, payload: UpdateHourEntryInput): Promise<HourEntryDTO> {
    if (USE_MOCK) return mock.update(id, payload);

    const res = await authFetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = data?.message ?? data?.error ?? `Falha ao atualizar lançamento (${res.status})`;
      throw new Error(msg);
    }

    return data as HourEntryDTO;
  },

  /**
   * Remove um lançamento (somente rascunhos)
   */
  async remove(id: string): Promise<void> {
    if (USE_MOCK) return mock.remove(id);

    const res = await authFetch(`${BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      const msg = data?.message ?? data?.error ?? `Falha ao excluir lançamento (${res.status})`;
      throw new Error(msg);
    }
  },

  /**
   * Lista lançamentos do terapeuta logado
   */
  async listMine(query: ListHourEntriesQuery): Promise<PagedResult<HourEntryDTO>> {
    if (USE_MOCK) return mock.listMine(query);

    const params = new URLSearchParams();

    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);
    if (query.patientId) params.append('patientId', query.patientId);
    if (query.status) params.append('status', query.status);
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());

    // Garantir que retorna somente os lançamentos do terapeuta
    params.append('scope', 'mine');

    const res = await authFetch(`${BASE}?${params.toString()}`, {
      method: 'GET',
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = data?.message ?? data?.error ?? `Falha ao listar lançamentos (${res.status})`;
      throw new Error(msg);
    }

    return data as PagedResult<HourEntryDTO>;
  },

  /**
   * Busca um lançamento específico por ID
   */
  async getById(id: string): Promise<HourEntryDTO> {
    if (USE_MOCK) return mock.getById(id);

    const res = await authFetch(`${BASE}/${id}`, {
      method: 'GET',
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = data?.message ?? data?.error ?? `Falha ao buscar lançamento (${res.status})`;
      throw new Error(msg);
    }

    return data as HourEntryDTO;
  },
};
