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
    // 🎵 Se for um ID mockado, retornar sessões do mock
    if (programId.startsWith('mock-')) {
        console.log('📦 [MOCK] Detectado ID mockado para sessões:', programId);
        
        try {
            const { mockMusiSessions } = await import('../variants/musicoterapia/mocks/mockSessions');
            const sessions = mockMusiSessions.filter(s => s.programId === programId);
            console.log('✅ [MOCK] Sessões encontradas:', sessions.length);
            return sessions;
        } catch (error) {
            console.warn('⚠️ [MOCK] Erro ao carregar sessões mockadas:', error);
            return [];
        }
    }
    
    const res = await fetch(`/api/ocp/programs/${programId}/sessions`, { 
        credentials: 'include' 
    });
    
    if (!res.ok) throw new Error(`Erro ao buscar as sessoes: ${res.statusText}`);

    const data = await res.json();

    return data.data;
}

export async function fetchProgramChart(programId: string): Promise<SerieLinha[]> {
    // 🎵 Se for um ID mockado, retornar dados mockados do gráfico
    if (programId.startsWith('mock-')) {
        console.log('📦 [MOCK] Detectado ID mockado para gráfico do programa, retornando dados mockados');
        try {
            const { mockMusiProgramChartData } = await import('../variants/musicoterapia/mocks/mockChartData');
            return mockMusiProgramChartData;
        } catch (error) {
            console.warn('⚠️ [MOCK] Erro ao carregar dados mockados do gráfico:', error);
            return [];
        }
    }
    
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
    // 🎵 Se for um ID mockado, retornar dados mockados do gráfico
    if (programId.startsWith('mock-') || stimulusId.startsWith('stim-')) {
        console.log('📦 [MOCK] Detectado ID mockado para gráfico do objetivo:', stimulusId);
        try {
            const { mockMusiStimulusChartDataMap } = await import('../variants/musicoterapia/mocks/mockChartData');
            const chartData = mockMusiStimulusChartDataMap[stimulusId];
            if (chartData) {
                console.log('✅ [MOCK] Dados do gráfico encontrados para:', stimulusId);
                return chartData;
            }
            console.warn('⚠️ [MOCK] Nenhum dado mockado encontrado para:', stimulusId);
            return [];
        } catch (error) {
            console.warn('⚠️ [MOCK] Erro ao carregar dados mockados do gráfico:', error);
            return [];
        }
    }
    
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
