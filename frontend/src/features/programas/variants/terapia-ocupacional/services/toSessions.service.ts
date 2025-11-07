// Service único para sessões TO (mock, sem back-end)
// Futuramente, trocar mock por fetch mantendo a interface

import type { ToSessionPayload, ToSessionResponse } from '../types';

export type SaveToSessionParams = ToSessionPayload;

export const toSessionsService = {
    /**
     * Salva uma nova sessão TO
     * Mock: simula latency e retorna id gerado
     */
    save: async (data: SaveToSessionParams): Promise<ToSessionResponse> => {
        // Simular latency de rede (400ms)
        await new Promise(resolve => setTimeout(resolve, 400));

        // Mock: validação básica
        if (!data.patientId) {
            throw new Error('Paciente obrigatório');
        }
        if (!data.goalTitle || data.goalTitle.trim().length === 0) {
            throw new Error('Título do objetivo obrigatório');
        }
        if (!data.achieved) {
            throw new Error('Campo "Conseguiu?" obrigatório');
        }
        if (!data.performanceNotes || data.performanceNotes.trim().length < 10) {
            throw new Error('Descrição do desempenho deve ter no mínimo 10 caracteres');
        }

        // Mock: retornar sucesso com id gerado
        const id = crypto.randomUUID();
        
        console.log('[TO Sessions Service] Sessão salva (mock):', {
            id,
            ...data,
        });

        return {
            id,
            success: true,
            message: 'Sessão registrada com sucesso',
        };
    },

    /**
     * Lista sessões TO (mock)
     * Futuramente: endpoint GET /api/to-sessions
     */
    list: async (filters?: { patientId?: string; programId?: string; from?: string; to?: string }) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('[TO Sessions Service] Listando sessões (mock):', filters);
        
        // Mock: retornar array vazio por enquanto
        return {
            items: [],
            total: 0,
        };
    },
};
