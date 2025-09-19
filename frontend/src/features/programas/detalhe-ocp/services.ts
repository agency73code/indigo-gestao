import type { ProgramDetail, SessionListItem } from './types';
import { mockProgramDetail } from './mocks/program.mock';
import { mockRecentSessions } from './mocks/sessions.mock';

// Flag para controlar uso de mocks durante desenvolvimento
const USE_LOCAL_MOCKS = false;

export async function fetchProgramById(programId: string): Promise<ProgramDetail> {
    if (USE_LOCAL_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            ...mockProgramDetail,
            id: programId
        };
    }

    const res = await fetch(`/api/ocp/programs/${programId}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Erro ao buscar programas: ${res.statusText}`);

    const data = await res.json();
    return data.data;
}

export async function fetchRecentSessions(programId: string, limit = 5): Promise<SessionListItem[]> {
    if (USE_LOCAL_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log(`Fetching sessions for program: ${programId}`);
        return mockRecentSessions.slice(0, limit);
    }

    return mockRecentSessions.slice(0, limit);
}