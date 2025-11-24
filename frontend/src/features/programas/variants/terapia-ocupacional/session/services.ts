// Services para Sessão de Terapia Ocupacional
import type {
    Patient,
    ToProgramDetail,
    ToSessionAttempt,
    ToSessionSummary,
} from './types';

/**
 * Busca pacientes para seleção na sessão TO
 */
export async function searchPatientsForToSession(_query: string): Promise<Patient[]> {
    // TODO: Implementar chamada real à API
    // Por enquanto, reutiliza o serviço padrão
    const { searchPatients } = await import('@/features/programas/consultar-programas/services');
    return searchPatients(_query);
}

/**
 * Busca detalhes do programa TO para registro de sessão
 */
export async function getToProgramDetail(_programId: string): Promise<ToProgramDetail> {
    // Se for o programa mock, retorna o mock com currentPerformanceLevel
    if (_programId === 'mock-to-001') {
        const { fetchToProgramById } = await import('../mocks/mockService');
        const detail = await fetchToProgramById(_programId);
        
        // Adapta para o formato TO
        return {
            id: detail.id,
            name: detail.name,
            patientId: detail.patientId,
            patientName: detail.patientName,
            therapistId: detail.therapistId,
            therapistName: detail.therapistName,
            goalTitle: detail.goalTitle,
            goalDescription: detail.goalDescription,
            shortTermGoalDescription: detail.shortTermGoalDescription,
            activitiesApplicationDescription: detail.stimuliApplicationDescription,
            status: detail.status,
            criteria: detail.criteria,
            currentPerformanceLevel: (detail as any).currentPerformanceLevel,
            prazoInicio: detail.prazoInicio,
            prazoFim: detail.prazoFim,
            activities: detail.stimuli.map((stimulus: any) => ({
                id: stimulus.id,
                label: stimulus.label,
                description: stimulus.description || '',
                active: stimulus.active,
                order: stimulus.order,
            })),
        };
    }
    
    // Para programas reais, usa o serviço padrão
    const { fetchProgramById } = await import('@/features/programas/detalhe-ocp/services');
    const detail = await fetchProgramById(_programId);
    
    // Adapta para o formato TO
    return {
        id: detail.id,
        name: detail.name,
        patientId: detail.patientId,
        patientName: detail.patientName,
        therapistId: detail.therapistId,
        therapistName: detail.therapistName,
        goalTitle: detail.goalTitle,
        goalDescription: detail.goalDescription,
        shortTermGoalDescription: detail.shortTermGoalDescription,
        activitiesApplicationDescription: detail.stimuliApplicationDescription,
        status: detail.status,
        criteria: detail.criteria,
        currentPerformanceLevel: (detail as any).currentPerformanceLevel,
        prazoInicio: detail.prazoInicio,
        prazoFim: detail.prazoFim,
        activities: detail.stimuli.map((stimulus: any) => ({
            id: stimulus.id,
            label: stimulus.label,
            description: stimulus.description || '',
            active: stimulus.active,
            order: stimulus.order,
        })),
    };
}

/**
 * Salva uma sessão TO completa
 */
export async function saveToSession(payload: {
    patientId: string;
    programId: string;
    attempts: ToSessionAttempt[];
    notes?: string;
}): Promise<void> {
    // TODO: Implementar chamada real à API
    console.log('Salvando sessão TO:', payload);
    
    // Simulação de delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock: sempre sucesso
    return Promise.resolve();
}

/**
 * Calcula o resumo estatístico da sessão TO baseado nas tentativas
 */
export function calculateToSessionSummary(attempts: ToSessionAttempt[]): ToSessionSummary {
    if (attempts.length === 0) {
        return {
            desempenhou: 0,
            desempenhouComAjuda: 0,
            naoDesempenhou: 0,
            totalAttempts: 0,
        };
    }

    const desempenhou = attempts.filter((a) => a.type === 'desempenhou').length;
    const desempenhouComAjuda = attempts.filter((a) => a.type === 'desempenhou-com-ajuda').length;
    const naoDesempenhou = attempts.filter((a) => a.type === 'nao-desempenhou').length;
    const totalAttempts = attempts.length;

    return {
        desempenhou,
        desempenhouComAjuda,
        naoDesempenhou,
        totalAttempts,
    };
}

/**
 * Calcula o resultado predominante para uma atividade
 * Retorna a cor do status: verde, laranja ou vermelho
 */
export function calculateToPredominantResult(
    desempenhou: number,
    ajuda: number,
    naoDesempenhou: number
): 'verde' | 'laranja' | 'vermelho' {
    const total = desempenhou + ajuda + naoDesempenhou;
    
    if (total === 0) return 'vermelho';

    // Identifica qual teve mais ocorrências
    const max = Math.max(desempenhou, ajuda, naoDesempenhou);

    if (desempenhou === max) return 'verde';
    if (ajuda === max) return 'laranja';
    return 'vermelho';
}
