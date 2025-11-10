// Service para sessões TO
// Abstrai chamadas de API (real ou mock)

import type { ToSessionPayload, ToSessionResponse, ToSessionListItem, ToSessionDetail } from '../types';
import { 
    mockSaveToSession, 
    mockListToSessionsByPatient, 
    mockGetToSessionById 
} from '../mocks/toSessions.api.mock';

// ============ CONFIGURAÇÃO ============
// 🔄 Trocar para false quando o backend estiver pronto
const USE_MOCK_API = true;

// ============ TIPOS PARA FILTROS ============
export interface ToSessionFilters {
    q?: string;                                      // busca de texto
    dateRange?: 'all' | 'last7' | 'last30' | 'year'; // período
    program?: string;                                // programa específico ou 'all'
    therapist?: string;                              // terapeuta específico ou 'all'
    sort?: 'date-desc' | 'date-asc' | 'program-asc'; // ordenação
    page?: number;                                   // paginação (futuro)
    pageSize?: number;                               // tamanho da página (futuro)
}

// ============ API FUNCTIONS ============

/**
 * Salva uma nova sessão TO
 */
async function saveToSessionAPI(data: ToSessionPayload): Promise<ToSessionResponse> {
    const response = await fetch('/api/to-sessions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Erro ao salvar sessão: ${response.status}`);
    }

    return response.json();
}

/**
 * Lista sessões TO por paciente com filtros
 */
async function listToSessionsByPatientAPI(patientId: string, filters: ToSessionFilters = {}): Promise<ToSessionListItem[]> {
    const {
        q = '',
        dateRange = 'all',
        program = 'all',
        therapist = 'all',
        sort = 'date-desc',
    } = filters;
    
    const url = new URL('/api/to-sessions', window.location.origin);
    url.searchParams.set('patientId', patientId);
    if (q) url.searchParams.set('q', q);
    if (dateRange !== 'all') url.searchParams.set('dateRange', dateRange);
    if (program !== 'all') url.searchParams.set('program', program);
    if (therapist !== 'all') url.searchParams.set('therapist', therapist);
    if (sort) url.searchParams.set('sort', sort);
    
    const response = await fetch(url.pathname + url.search, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
        throw new Error(`Erro ao carregar sessões: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || data;
}

/**
 * Busca detalhes de uma sessão TO
 */
async function getToSessionByIdAPI(sessionId: string): Promise<ToSessionDetail | null> {
    const response = await fetch(`/api/to-sessions/${sessionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Erro ao buscar sessão: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || data;
}

// ============ SERVICE (usa Mock ou API Real) ============

export type SaveToSessionParams = ToSessionPayload;

export const toSessionsService = {
    /**
     * Salva uma nova sessão TO
     * 
     * 🔄 Para ativar API real: USE_MOCK_API = false
     */
    save: async (data: SaveToSessionParams): Promise<ToSessionResponse> => {
        if (USE_MOCK_API) {
            return mockSaveToSession(data);
        }
        return saveToSessionAPI(data);
    },

    /**
     * Lista sessões TO por paciente com filtros
     * 
     * 🔄 Para ativar API real: USE_MOCK_API = false
     * 
     * Query params enviados ao backend:
     * - patientId (obrigatório)
     * - q (opcional) - busca de texto
     * - dateRange (opcional) - all | last7 | last30 | year
     * - program (opcional) - nome do programa ou 'all'
     * - therapist (opcional) - nome do terapeuta ou 'all'
     * - sort (opcional) - date-desc | date-asc | program-asc
     */
    listByPatient: async (patientId: string, filters: ToSessionFilters = {}): Promise<ToSessionListItem[]> => {
        if (USE_MOCK_API) {
            return mockListToSessionsByPatient(patientId);
        }
        return listToSessionsByPatientAPI(patientId, filters);
    },

    /**
     * Busca detalhes de uma sessão TO
     * 
     * 🔄 Para ativar API real: USE_MOCK_API = false
     */
    getById: async (sessionId: string): Promise<ToSessionDetail | null> => {
        if (USE_MOCK_API) {
            return mockGetToSessionById(sessionId);
        }
        return getToSessionByIdAPI(sessionId);
    },
};
