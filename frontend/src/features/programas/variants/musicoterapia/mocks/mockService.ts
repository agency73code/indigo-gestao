/**
 * Serviço mock para desenvolvimento de Musicoterapia
 * Simula chamadas de API para programas de Musicoterapia
 * 
 * IMPORTANTE: Este mock reflete a estrutura de dados real que o backend deve implementar
 * - Programas com 4 campos nos objetivos específicos (objetivo, objetivoEspecifico, metodos, tecnicasProcedimentos)
 * - Sessões com atividades detalhadas e observações
 * - Gráficos de evolução por atividade e geral
 */

import { mockMusiProgram } from './programMock';
import { mockMusiSessions } from './mockSessions';
import { getMockMusiChartData } from './mockChartService';
import type { ProgramDetail } from '../../../detalhe-ocp/types';
import type { SessionListItem } from '../../../detalhe-ocp/types';
import type { SerieLinha } from '../../../relatorio-geral/types';

export async function fetchMusiProgramById(id: string): Promise<ProgramDetail> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('🎵 Retornando programa MOCK de Musicoterapia:', id);
    
    // Transformar o mock para o formato ProgramDetail flat esperado
    return {
        id: mockMusiProgram.id,
        name: mockMusiProgram.name,
        patientId: mockMusiProgram.patientId,
        patientName: mockMusiProgram.patient.name,
        patientGuardian: mockMusiProgram.patient.guardianName,
        patientAge: mockMusiProgram.patient.age,
        patientPhotoUrl: mockMusiProgram.patient.photoUrl,
        therapistId: mockMusiProgram.therapistId,
        therapistName: mockMusiProgram.therapist.name,
        therapistPhotoUrl: mockMusiProgram.therapist.photoUrl,
        createdAt: mockMusiProgram.createdAt,
        goalTitle: mockMusiProgram.goalTitle,
        goalDescription: mockMusiProgram.goalDescription,
        longTermGoalDescription: mockMusiProgram.goalDescription,
        shortTermGoalDescription: mockMusiProgram.shortTermGoalDescription,
        stimuliApplicationDescription: mockMusiProgram.stimuliApplicationDescription,
        stimuli: mockMusiProgram.stimuli,
        criteria: mockMusiProgram.criteria,
        notes: mockMusiProgram.notes,
        status: mockMusiProgram.status,
        prazoInicio: mockMusiProgram.prazoInicio,
        prazoFim: mockMusiProgram.prazoFim,
    };
}

export async function fetchMusiRecentSessions(programId: string, limit: number = 5): Promise<SessionListItem[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log('📅 Retornando sessões MOCK de Musicoterapia:', programId, 'limit:', limit);
    
    return mockMusiSessions.slice(0, limit);
}

export async function fetchMusiProgramChart(programId: string): Promise<SerieLinha[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log('📊 Retornando gráfico geral MOCK de Musicoterapia:', programId);
    
    // Retornar evolução geral do programa com dados das sessões reais
    return getMockMusiChartData();
}
