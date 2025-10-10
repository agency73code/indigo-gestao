import type { ProgramDetail, SessionListItem } from './types';
import { mockProgramDetail } from './mocks/program.mock';
import { mockRecentSessions } from './mocks/sessions.mock';
import * as Api from '../api';

// Flag para controlar uso de mocks durante desenvolvimento
const USE_LOCAL_MOCKS = true;

export async function fetchProgramById(programId: string): Promise<ProgramDetail> {
    try { 
        const program = await Api.fetchProgram(programId);
        
        // TODO: Remover este mock quando o backend adicionar o campo stimuliApplicationDescription
        // Mock temporário para simular a descrição da aplicação
        if (!program.stimuliApplicationDescription) {
            program.stimuliApplicationDescription = 
                'Aplique os estímulos nas sessões diárias, utilizando reforçadores preferidos e alternando contextos (sala, pátio e refeitório) para favorecer a generalização.';
        }
        
        return program;
    } catch {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            ...mockProgramDetail,
            id: programId
        };
    }
}

export async function fetchRecentSessions(programId: string, limit = 5): Promise<SessionListItem[]> {
    try {
        const res = await fetch(`/api/ocp/programs/${programId}/sessions`, { credentials: 'include' });
        if (!res.ok) throw new Error(`Erro ao buscar as sessoes: ${res.statusText}`);

        const data = await res.json();
        return data.data;
    } catch {
        if (USE_LOCAL_MOCKS) {
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log(`Fetching sessions for program: ${programId}`);
            return mockRecentSessions.slice(0, limit);
        }
        return [];
    }
}