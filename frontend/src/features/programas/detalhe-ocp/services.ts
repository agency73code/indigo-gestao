import type { ProgramDetail, SessionListItem } from './types';
import type { SerieLinha } from '../relatorio-geral/types';
import * as Api from '../api';

export async function fetchProgramById(programId: string): Promise<ProgramDetail> {
    const program = await Api.fetchProgram(programId);

    if (!program.stimuliApplicationDescription) {
        program.stimuliApplicationDescription =
            'Aplique os estímulos nas sessões diárias, utilizando reforçadores preferidos e alternando contextos (sala, pátio e refeitório) para favorecer a generalização.';
    }

    return program;
}

export async function fetchRecentSessions(programId: string, _limit = 5): Promise<SessionListItem[]> {
    const res = await fetch(`/api/ocp/programs/${programId}/sessions`, { 
        credentials: 'include' 
    });
    if (!res.ok) throw new Error(`Erro ao buscar as sessoes: ${res.statusText}`);

    const data = await res.json();

    return data.data;
}

export async function fetchProgramChart(programId: string): Promise<SerieLinha[]> {
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
}

export async function fetchStimulusChart(
    programId: string,
    stimulusId: string,
): Promise<SerieLinha[]> {
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
}
