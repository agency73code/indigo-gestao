import type { ProgramDetail, SessionListItem } from './types';
import { mockProgramDetail } from './mocks/program.mock';
import { mockRecentSessions } from './mocks/sessions.mock';

// Flag para controlar uso de mocks durante desenvolvimento
const USE_LOCAL_MOCKS = true;

export async function fetchProgramById(programaId: string): Promise<ProgramDetail> {
    if (USE_LOCAL_MOCKS) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Retornar mock com o ID solicitado
        return {
            ...mockProgramDetail,
            id: programaId
        };
    }
    
    // TODO: Implementar chamada real para API quando disponível
    // const response = await fetch(`/api/programs/${programaId}`);
    // if (!response.ok) {
    //     throw new Error(`Erro ao buscar programa: ${response.statusText}`);
    // }
    // return await response.json();
    
    throw new Error('API real ainda não implementada');
}

export async function fetchRecentSessions(programaId: string, limit = 5): Promise<SessionListItem[]> {
    if (USE_LOCAL_MOCKS) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Retornar mocks limitados (programaId será usado na implementação real)
        console.log(`Fetching sessions for program: ${programaId}`);
        return mockRecentSessions.slice(0, limit);
    }
    
    // TODO: Implementar chamada real para API quando disponível
    // const response = await fetch(`/api/programs/${programaId}/sessions?limit=${limit}`);
    // if (!response.ok) {
    //     throw new Error(`Erro ao buscar sessões: ${response.statusText}`);
    // }
    // return await response.json();
    
    throw new Error('API real ainda não implementada');
}