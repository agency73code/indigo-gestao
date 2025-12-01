/**
 * Serviço mock para desenvolvimento de TO
 * Simula chamadas de API para programas de TO
 */

import { mockToProgram } from './programMock';
import { mockToSessions } from './mockSessions';
import type { ProgramDetail } from '../../../detalhe-ocp/types';
import type { SessionListItem } from '../../../detalhe-ocp/types';
import type { SerieLinha } from '../../../relatorio-geral/types';

export async function fetchToProgramById(id: string): Promise<ProgramDetail> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('🎭 Retornando programa MOCK de TO:', id);
    
    // Transformar o mock para o formato ProgramDetail flat esperado
    return {
        id: mockToProgram.id,
        name: mockToProgram.name,
        patientId: mockToProgram.patientId,
        patientName: mockToProgram.patient.name,
        patientGuardian: mockToProgram.patient.guardianName,
        patientAge: mockToProgram.patient.age,
        patientPhotoUrl: mockToProgram.patient.photoUrl,
        therapistId: mockToProgram.therapistId,
        therapistName: mockToProgram.therapist.name,
        therapistPhotoUrl: mockToProgram.therapist.photoUrl,
        createdAt: mockToProgram.createdAt,
        goalTitle: mockToProgram.goalTitle,
        goalDescription: mockToProgram.goalDescription,
        longTermGoalDescription: mockToProgram.goalDescription,
        shortTermGoalDescription: mockToProgram.shortTermGoalDescription,
        stimuliApplicationDescription: mockToProgram.stimuliApplicationDescription,
        stimuli: mockToProgram.stimuli,
        criteria: mockToProgram.criteria,
        notes: mockToProgram.notes,
        status: mockToProgram.status,
        prazoInicio: mockToProgram.prazoInicio,
        prazoFim: mockToProgram.prazoFim,
    };
}

export async function fetchToRecentSessions(programId: string, limit: number = 5): Promise<SessionListItem[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log('📅 Retornando sessões MOCK de TO:', programId, 'limit:', limit);
    
    return mockToSessions.slice(0, limit);
}

export async function fetchToProgramChart(programId: string): Promise<SerieLinha[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log('📊 Retornando gráfico geral MOCK de TO:', programId);
    
    // Retornar evolução geral do programa (não de um estímulo específico)
    const mockChartData: SerieLinha[] = [
        { x: '10/11', acerto: 69, independencia: 30 },  // 69% desempenhou, 30% com ajuda
        { x: '10/11', acerto: 70, independencia: 28 },  // evolução positiva
        { x: '14/11', acerto: 74, independencia: 26 },  
        { x: '14/11', acerto: 87, independencia: 20 },  
        { x: '17/11', acerto: 79, independencia: 18 },  // 79% desempenhou média
    ];
    
    return mockChartData;
}

