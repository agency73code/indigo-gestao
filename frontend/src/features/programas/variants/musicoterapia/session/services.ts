// Services para Sessão de Musicoterapia
import { buildSessionFormData } from '@/lib/api';
import { MUSI_AREA_ID } from '../constants';
import type {
    Patient,
    MusiProgramDetail,
    MusiSessionAttempt,
    MusiSessionSummary,
    SessionFile,
} from './types';

const area = MUSI_AREA_ID;
/**
 * Busca pacientes para seleção na sessão de Musicoterapia
 */
export async function searchPatientsForMusiSession(_query: string): Promise<Patient[]> {
    const { searchPatients } = await import('@/features/programas/consultar-programas/services');
    return searchPatients(_query);
}

/**
 * Busca detalhes do programa de Musicoterapia para registro de sessão
 */
export async function getMusiProgramDetail(_programId: string): Promise<MusiProgramDetail> {
    const { fetchProgramById } = await import('@/features/programas/detalhe-ocp/services');
    const detail = await fetchProgramById(_programId);

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
        prazoInicio: detail.prazoInicio,
        prazoFim: detail.prazoFim,
        activities: detail.stimuli.map((stimulus: any) => ({
            id: stimulus.id,
            label: stimulus.label,
            description: stimulus.description || '',
            metodos: stimulus.methods || '',
            tecnicasProcedimentos: stimulus.techniquesProcedures || '',
            active: stimulus.active,
            order: stimulus.order,
        })),
    };
}

/**
 * Salva uma sessão de Musicoterapia completa
 */
export async function saveMusiSession(payload: {
    patientId: string;
    programId: string;
    attempts: MusiSessionAttempt[];
    notes?: string;
    files?: SessionFile[];
}): Promise<void> {
    const formData = buildSessionFormData({
        ...payload,
        area,
    });

    const response = await fetch(`/api/ocp/musictherapy/programs/${payload.programId}/sessions`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json();
        console.error('Erro ao enviar sessão de Musicoterapia:', err);
        throw new Error('Erro ao criar sessão');
    }
}

/**
 * Calcula o resumo estatístico da sessão de Musicoterapia
 */
export function calculateMusiSessionSummary(attempts: MusiSessionAttempt[]): MusiSessionSummary {
    if (attempts.length === 0) {
        return {
            desempenhou: 0,
            desempenhouComAjuda: 0,
            naoDesempenhou: 0,
            totalAttempts: 0,
            avgParticipacao: null,
            avgSuporte: null,
        };
    }

    const desempenhou = attempts.filter((a) => a.type === 'desempenhou').length;
    const desempenhouComAjuda = attempts.filter((a) => a.type === 'desempenhou-com-ajuda').length;
    const naoDesempenhou = attempts.filter((a) => a.type === 'nao-desempenhou').length;
    const totalAttempts = attempts.length;

    // Calcular média de participação (0-5)
    const participacaoValues = attempts
        .filter((a) => a.participacao !== undefined && a.participacao !== null)
        .map((a) => a.participacao as number);
    const avgParticipacao = participacaoValues.length > 0
        ? participacaoValues.reduce((sum, val) => sum + val, 0) / participacaoValues.length
        : null;

    // Calcular média de suporte (1-5)
    const suporteValues = attempts
        .filter((a) => a.suporte !== undefined && a.suporte !== null)
        .map((a) => a.suporte as number);
    const avgSuporte = suporteValues.length > 0
        ? suporteValues.reduce((sum, val) => sum + val, 0) / suporteValues.length
        : null;

    return {
        desempenhou,
        desempenhouComAjuda,
        naoDesempenhou,
        totalAttempts,
        avgParticipacao,
        avgSuporte,
    };
}

/**
 * Calcula o resultado predominante para uma atividade
 */
export function calculateMusiPredominantResult(
    desempenhou: number,
    ajuda: number,
    naoDesempenhou: number
): 'verde' | 'laranja' | 'vermelho' {
    const total = desempenhou + ajuda + naoDesempenhou;
    
    if (total === 0) return 'vermelho';

    const max = Math.max(desempenhou, ajuda, naoDesempenhou);
    
    if (max === desempenhou) return 'verde';
    if (max === ajuda) return 'laranja';
    return 'vermelho';
}

// Alias para compatibilidade com componentes compartilhados
export const calculateToPredominantResult = calculateMusiPredominantResult;

/**
 * Inicializa arquivos mock de sessão (apenas para desenvolvimento)
 */
export function initializeMockSessionFiles(): void {
    // Placeholder para inicialização de mocks
}
