// Service para lançamento de horas - VIEW DE TERAPEUTA
// Utiliza authFetch para garantir autenticação e permissões

import { authFetch } from '@/lib/http';
import type {
  CreateHourEntryInput,
  HourEntryDTO,
  ListHourEntriesQuery,
  PagedResult,
  UpdateHourEntryInput,
} from '../types/hourEntry.types';

const BASE = '/api/faturamento/lancamentos';

/**
 * Service para gestão de lançamentos de horas (visão terapeuta)
 * Não lida com valores - apenas horas trabalhadas
 */
export const hourEntryService = {
  /**
   * Cria um novo lançamento em rascunho
   */
  create: async (payload: CreateHourEntryInput): Promise<HourEntryDTO> => {
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
  submit: async (id: string): Promise<HourEntryDTO> => {
    const res = await authFetch(`${BASE}/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = data?.message ?? data?.error ?? `Falha ao enviar lançamento (${res.status})`;
      throw new Error(msg);
    }

    return data as HourEntryDTO;
  },

  /**
   * Atualiza um lançamento existente (somente rascunhos ou pendentes)
   */
  update: async (id: string, payload: UpdateHourEntryInput): Promise<HourEntryDTO> => {
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
  remove: async (id: string): Promise<void> => {
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
  listMine: async (query: ListHourEntriesQuery): Promise<PagedResult<HourEntryDTO>> => {
    const params = new URLSearchParams();

    if (query.from) params.append('from', query.from);
    if (query.to) params.append('to', query.to);
    if (query.patientId) params.append('patientId', query.patientId);
    if (query.status && query.status !== 'all') {
      if (Array.isArray(query.status)) {
        query.status.forEach((s) => params.append('status', s));
      } else {
        params.append('status', query.status);
      }
    }
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
  getById: async (id: string): Promise<HourEntryDTO> => {
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
