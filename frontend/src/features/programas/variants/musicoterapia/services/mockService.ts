/**
 * Serviço mock para Musicoterapia
 * Usa localStorage para persistência durante desenvolvimento
 */

import { mockMusiProgram } from '../mocks/programMock';
import { mockMusiProgramList } from '../mocks/programListMock';
import { mockMusiSessions, mockMusiSessionsDetailed } from '../mocks/mockSessions';
import { getMockMusiChartData } from '../mocks/mockChartService';
import type { ProgramDetail } from '../../../nova-sessao/types';
import type { ProgramListItem } from '../../../consultar-programas/types';
import type { SessionListItem } from '../../../detalhe-ocp/types';
import type { SerieLinha } from '../../../relatorio-geral/types';
import type { MusiSessionPayload, MusiSessionResponse, MusiSessionListItem, MusiSessionDetail } from '../types';
import type { CreateProgramInput } from '../../../core/types';

const STORAGE_KEY = 'musi_mock_data';

interface MockStorage {
    programs: ProgramDetail[];
    sessions: MusiSessionDetail[];
}

function getStorage(): MockStorage {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.warn('Erro ao ler mock storage:', e);
    }
    
    // Inicializa com dados mock
    const initial: MockStorage = {
        programs: [mockMusiProgram as unknown as ProgramDetail],
        sessions: mockMusiSessionsDetailed as unknown as MusiSessionDetail[],
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
}

function saveStorage(data: MockStorage): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Delay simulado de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Busca programa por ID (mock)
 */
export async function fetchMusiProgramById(id: string): Promise<ProgramDetail> {
    await delay(500);
    
    const storage = getStorage();
    const program = storage.programs.find(p => p.id === id);
    
    if (!program) {
        // Retorna mock padrão se não encontrar
        console.log('🎵 [MOCK] Programa não encontrado, retornando mock padrão');
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
    
    console.log('🎵 [MOCK] Retornando programa:', program.name);
    return program;
}

/**
 * Lista programas (mock)
 */
export async function fetchMusiPrograms(filters?: {
    patientId?: string;
    status?: string;
}): Promise<ProgramListItem[]> {
    await delay(400);
    
    let result = [...mockMusiProgramList];
    
    if (filters?.patientId) {
        result = result.filter(p => p.patientId === filters.patientId);
    }
    
    if (filters?.status) {
        result = result.filter(p => p.status === filters.status);
    }
    
    console.log('🎵 [MOCK] Retornando', result.length, 'programas');
    return result;
}

/**
 * Cria programa (mock)
 */
export async function createMusiProgram(data: CreateProgramInput): Promise<{ id: string }> {
    await delay(800);
    
    const storage = getStorage();
    const newId = `musi-${Date.now()}`;
    
    // Transforma stimuli para o formato do ProgramDetail
    const stimuliForStorage = data.stimuli?.map((s, index) => ({
        id: s.id || crypto.randomUUID(),
        order: index,
        label: s.label,
        description: s.description || null,
        active: true,
    })) || [];

    const newProgram: ProgramDetail = {
        id: newId,
        createdAt: new Date().toISOString(),
        status: 'active',
        name: data.name || data.goalTitle || '',
        patientId: data.patientId,
        therapistId: data.therapistId,
        goalTitle: data.goalTitle || '',
        goalDescription: data.goalDescription || '',
        longTermGoalDescription: data.goalDescription || '',
        shortTermGoalDescription: data.shortTermGoalDescription || '',
        stimuliApplicationDescription: data.stimuliApplicationDescription || '',
        stimuli: stimuliForStorage,
        criteria: data.criteria || '',
        notes: data.notes || '',
        prazoInicio: data.prazoInicio || null,
        prazoFim: data.prazoFim || null,
    } as ProgramDetail;
    
    storage.programs.push(newProgram);
    saveStorage(storage);
    
    console.log('🎵 [MOCK] Programa criado:', newProgram.name);
    return { id: newId };
}

/**
 * Atualiza programa (mock)
 */
export async function updateMusiProgram(id: string, data: Partial<ProgramDetail>): Promise<ProgramDetail> {
    await delay(600);
    
    const storage = getStorage();
    const index = storage.programs.findIndex(p => p.id === id);
    
    if (index === -1) {
        throw new Error('Programa não encontrado');
    }
    
    storage.programs[index] = { ...storage.programs[index], ...data };
    saveStorage(storage);
    
    console.log('🎵 [MOCK] Programa atualizado:', storage.programs[index].name);
    return storage.programs[index];
}

/**
 * Busca sessões recentes do programa (mock)
 */
export async function fetchMusiRecentSessions(programId: string, limit: number = 5): Promise<SessionListItem[]> {
    await delay(400);
    
    console.log('📅 [MOCK] Retornando sessões recentes:', programId);
    return mockMusiSessions.slice(0, limit);
}

/**
 * Busca dados do gráfico do programa (mock)
 */
export async function fetchMusiProgramChart(programId: string): Promise<SerieLinha[]> {
    await delay(500);
    
    console.log('📊 [MOCK] Retornando gráfico:', programId);
    return getMockMusiChartData();
}

/**
 * Salva sessão (mock)
 */
export async function saveMusiSession(payload: MusiSessionPayload): Promise<MusiSessionResponse> {
    await delay(800);
    
    const storage = getStorage();
    const newSession: MusiSessionDetail = {
        id: `session-musi-${Date.now()}`,
        date: payload.date,
        patientId: payload.patientId || '',
        patientName: 'Mock Patient',
        therapistId: payload.therapistId || '',
        therapistName: 'Mock Therapist',
        programId: payload.programId || '',
        programName: 'Mock Program',
        goalTitle: payload.goalTitle,
        achieved: payload.achieved,
        frequency: payload.frequency,
        durationMin: payload.durationMin,
        performanceNotes: payload.performanceNotes,
        clinicalNotes: payload.clinicalNotes,
    };
    
    storage.sessions.push(newSession);
    saveStorage(storage);
    
    console.log('🎵 [MOCK] Sessão salva:', newSession.id);
    return {
        id: newSession.id,
        success: true,
        message: 'Sessão de Musicoterapia salva com sucesso!',
    };
}

/**
 * Lista sessões (mock)
 */
export async function fetchMusiSessions(filters?: {
    patientId?: string;
    programId?: string;
}): Promise<MusiSessionListItem[]> {
    await delay(400);
    
    let result = mockMusiSessionsDetailed as unknown as MusiSessionListItem[];
    
    if (filters?.patientId) {
        result = result.filter(s => s.patientId === filters.patientId);
    }
    
    // programId não está no tipo MusiSessionListItem, então ignoramos
    // Em produção, isso seria filtrado no backend
    
    console.log('🎵 [MOCK] Retornando', result.length, 'sessões');
    return result;
}

/**
 * Busca detalhe da sessão (mock)
 */
export async function fetchMusiSessionById(id: string): Promise<MusiSessionDetail> {
    await delay(400);
    
    const storage = getStorage();
    const session = storage.sessions.find(s => s.id === id);
    
    if (!session) {
        // Retorna primeira sessão mock se não encontrar
        console.log('🎵 [MOCK] Sessão não encontrada, retornando mock');
        return mockMusiSessionsDetailed[0] as unknown as MusiSessionDetail;
    }
    
    console.log('🎵 [MOCK] Retornando sessão:', session.id);
    return session;
}
