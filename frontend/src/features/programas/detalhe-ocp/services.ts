import type { ProgramDetail, SessionListItem } from './types';
import type { SerieLinha } from '../relatorio-geral/types';
import { mockProgramDetail } from './mocks/program.mock';
import { mockRecentSessions } from './mocks/sessions.mock';
import { mockSerieLinha } from '../relatorio-geral/mocks/relatorio.mock';
import * as Api from '../api';

const USE_LOCAL_MOCKS = true;

export async function fetchProgramById(programId: string): Promise<ProgramDetail> {
    try {
        const program = await Api.fetchProgram(programId);

        if (!program.stimuliApplicationDescription) {
            program.stimuliApplicationDescription =
                'Aplique os estímulos nas sessões diárias, utilizando reforçadores preferidos e alternando contextos (sala, pátio e refeitório) para favorecer a generalização.';
        }

        return program;
    } catch {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
            ...mockProgramDetail,
            id: programId,
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
            await new Promise((resolve) => setTimeout(resolve, 300));
            console.log(`Fetching sessions for program: ${programId}`);
            return mockRecentSessions.slice(0, limit);
        }
        return [];
    }
}

export async function fetchProgramChart(programId: string): Promise<SerieLinha[]> {
    try {
        const filters = {
            programaId: programId,
            periodo: { mode: '30d' as const },
        };

        const filtersParam = encodeURIComponent(JSON.stringify(filters));
        const res = await fetch(`/api/ocp/reports/kpis/${filtersParam}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!res.ok) throw new Error(`Erro ao buscar dados do gráfico: ${res.statusText}`);

        const data = await res.json();
        return data.graphic || [];
    } catch (error) {
        console.error('Erro ao buscar gráfico do programa:', error);

        if (USE_LOCAL_MOCKS) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            return mockSerieLinha;
        }

        return [];
    }
}

export async function fetchStimulusChart(
    programId: string,
    stimulusId: string,
): Promise<SerieLinha[]> {
    try {
        const filters = {
            programaId: programId,
            estimuloId: stimulusId,
            periodo: { mode: '30d' as const },
        };

        const filtersParam = encodeURIComponent(JSON.stringify(filters));
        const res = await fetch(`/api/ocp/reports/kpis/${filtersParam}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!res.ok) throw new Error(`Erro ao buscar dados do gráfico: ${res.statusText}`);

        const data = await res.json();
        return data.graphic || [];
    } catch (error) {
        console.error('Erro ao buscar gráfico do estímulo:', error);

        if (USE_LOCAL_MOCKS) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            return mockSerieLinha;
        }

        return [];
    }
}
