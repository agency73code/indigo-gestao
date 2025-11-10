// API Mock para sessões TO
// Simula endpoints do backend usando localStorage

import type { ToSessionPayload, ToSessionResponse, ToSessionListItem, ToSessionDetail } from '../types';
import { getSessionsFromStorage, saveSessionsToStorage, initializeMockData } from './toSessions.mock';

// Inicializar dados mock
initializeMockData();

// ============ MOCK API ENDPOINTS ============

/**
 * POST /api/to-sessions
 * Cria uma nova sessão TO
 */
export async function mockSaveToSession(data: ToSessionPayload): Promise<ToSessionResponse> {
    // Simular latency de rede (400ms)
    await new Promise(resolve => setTimeout(resolve, 400));

    // Validação básica
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

    // Criar nova sessão
    const newSession: ToSessionDetail = {
        id: `to-session-${Date.now()}`,
        date: data.date,
        patientId: data.patientId,
        patientName: 'Paciente Mock', // Mock: buscar do data.patient se necessário
        therapistId: data.therapistId || 'terapeuta-1',
        therapistName: 'Terapeuta Atual',
        programId: data.programId || 'prog-to-1',
        programName: 'Programa TO', // Mock: buscar do data.program se necessário
        goalTitle: data.goalTitle,
        goalDescription: undefined,
        achieved: data.achieved,
        frequency: data.frequency,
        durationMin: data.durationMin,
        performanceNotes: data.performanceNotes,
        clinicalNotes: data.clinicalNotes,
        attachments: data.attachments?.map((file, idx) => ({
            url: typeof file === 'string' ? file : URL.createObjectURL(file),
            name: typeof file === 'string' ? `arquivo-${idx + 1}` : file.name,
            type: data.documentType || 'Documento',
        })),
    };

    const sessions = getSessionsFromStorage();
    sessions.unshift(newSession); // Adiciona no início (mais recente primeiro)
    saveSessionsToStorage(sessions);
    
    console.log('[TO Mock API] Sessão salva:', newSession);

    return {
        id: newSession.id,
        success: true,
        message: 'Sessão registrada com sucesso',
    };
}

/**
 * GET /api/to-sessions?patientId=...&q=...&dateRange=...&program=...&therapist=...&sort=...
 * Lista sessões TO de um paciente com filtros
 */
export async function mockListToSessionsByPatient(patientId: string): Promise<ToSessionListItem[]> {
    // Simular latency de rede (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('[TO Mock API] Listando sessões do paciente:', patientId);
    
    const allSessions = getSessionsFromStorage();
    const patientSessions = allSessions.filter(s => s.patientId === patientId);
    
    console.log('[TO Mock API] Sessões encontradas:', patientSessions.length);
    
    // Converter para ToSessionListItem
    const listItems: ToSessionListItem[] = patientSessions.map(session => ({
        id: session.id,
        date: session.date,
        patientId: session.patientId,
        patientName: session.patientName,
        therapistId: session.therapistId,
        therapistName: session.therapistName,
        programName: session.programName,
        goalTitle: session.goalTitle,
        achieved: session.achieved,
        frequency: session.frequency,
        durationMin: session.durationMin,
    }));
    
    // Ordenar por data (mais recentes primeiro)
    listItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return listItems;
}

/**
 * GET /api/to-sessions/:id
 * Busca detalhes de uma sessão TO
 */
export async function mockGetToSessionById(sessionId: string): Promise<ToSessionDetail | null> {
    // Simular latency de rede (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('[TO Mock API] Buscando sessão por ID:', sessionId);
    
    const allSessions = getSessionsFromStorage();
    const session = allSessions.find(s => s.id === sessionId);
    
    return session || null;
}
