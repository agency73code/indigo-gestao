// Services para Sessão de Fisioterapia
import { buildSessionFormData } from '@/lib/api';
import type {
    Patient,
    FisioProgramDetail,
    FisioSessionAttempt,
    FisioSessionSummary,
    SessionFile,
    DadosFaturamentoSessao,
} from './types';
import type { AreaType } from '@/contexts/AreaContext';

/**
 * Busca pacientes para seleção na sessão TO
 */
export async function searchPatientsForFisioSession(_query: string): Promise<Patient[]> {
    // TODO: Implementar chamada real à API
    // Por enquanto, reutiliza o serviço padrão
    const { searchPatients } = await import('@/features/programas/consultar-programas/services');
    return searchPatients(_query);
}

/**
 * Busca detalhes do programa Fisio para registro de sessão
 */
export async function getFisioProgramDetail(_programId: string): Promise<FisioProgramDetail> {
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
 * Salva uma sessão Fisio completa
 */
export async function saveFisioSession(payload: {
    patientId: string;
    programId: string;
    attempts: FisioSessionAttempt[];
    notes?: string;
    files?: SessionFile[];
    area: AreaType;
    faturamento?: DadosFaturamentoSessao;
}): Promise<void> {
    // TODO: Implementar chamada real à API
    const formData = buildSessionFormData(payload);
    
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(key, {
            name: value.name,
            type: value.type,
            size: value.size,
            });
        } else {
            console.log(key, value);
        }
    }

    const response = await fetch(`/api/ocp/physiotherapy/programs/${payload.programId}/sessions`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (response.status === 413) {
        throw new Error('FILE_TOO_LARGE');
    }

    if (!response.ok) {
        const err = await response.json();

        console.error('Erro ao enviar sessão Fisioterapia:', err);
        throw new Error('Erro ao criar sessão');
    }
}

/**
 * Calcula o resumo estatístico da sessão Fisio baseado nas tentativas
 */
export function calculateFisioSessionSummary(attempts: FisioSessionAttempt[]): FisioSessionSummary {
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

/**
 * Recupera os arquivos salvos de uma sessão do localStorage (mock)
 */
export function getSessionFiles(sessionId: string): Array<{
    id: string;
    name: string;
    fileName: string;
    type: string;
    size: number;
    url: string;
}> {
    try {
        const sessionData = localStorage.getItem(sessionId);
        if (!sessionData) {
            return [];
        }
        
        const session = JSON.parse(sessionData);
        if (!session.files || session.files.length === 0) {
            return [];
        }
        
        return session.files.map((file: any) => ({
            id: file.id,
            name: file.name,
            fileName: file.fileName,
            type: file.type,
            size: file.size,
            url: file.data, // URL em base64
        }));
    } catch (error) {
        console.error('Erro ao recuperar arquivos do localStorage:', error);
        return [];
    }
}

/**
 * Lista todas as sessões salvas de um programa (mock)
 */
export function listProgramSessions(programId: string): Array<{
    id: string;
    createdAt: string;
    filesCount: number;
}> {
    try {
        const sessionsListKey = `to-sessions-list-${programId}`;
        const existingList = localStorage.getItem(sessionsListKey);
        
        if (!existingList) {
            return [];
        }
        
        const sessionsList = JSON.parse(existingList);
        
        return sessionsList.map((sessionKey: string) => {
            const sessionData = localStorage.getItem(sessionKey);
            if (!sessionData) {
                return null;
            }
            
            const session = JSON.parse(sessionData);
            return {
                id: session.id,
                createdAt: session.createdAt,
                filesCount: session.files?.length || 0,
            };
        }).filter(Boolean);
    } catch (error) {
        console.error('Erro ao listar sessões do localStorage:', error);
        return [];
    }
}

/**
 * Inicializa arquivos mock para as sessões Fisio (apenas para desenvolvimento)
 */
export function initializeMockSessionFiles() {
    const mockFiles = {
        'session-to-001': [
            {
                id: 'file-001-1',
                name: 'Foto - Progresso vestir camiseta',
                fileName: 'vestir_camiseta_17nov.jpg',
                type: 'image/jpeg',
                size: 245000,
                data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA==',
            },
            {
                id: 'file-001-2',
                name: 'Vídeo - Execução completa da atividade',
                fileName: 'atividade_completa.mp4',
                type: 'video/mp4',
                size: 1200000,
                data: 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAAhtZGF0AAAA',
            },
        ],
        'session-to-002': [
            {
                id: 'file-002-1',
                name: 'Relatório de desempenho',
                fileName: 'relatorio_14nov.pdf',
                type: 'application/pdf',
                size: 89000,
                data: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoIDQ+PnN0cmVhbQp4nGMK5WJgAAIAAgQAKw==',
            },
        ],
        'session-to-003': [
            {
                id: 'file-003-1',
                name: 'Foto - Botões grandes utilizados',
                fileName: 'botoes_grandes.jpg',
                type: 'image/jpeg',
                size: 312000,
                data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA==',
            },
            {
                id: 'file-003-2',
                name: 'Foto - Apoio visual utilizado',
                fileName: 'apoio_visual_camisa.jpg',
                type: 'image/jpeg',
                size: 278000,
                data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA==',
            },
        ],
    };

    // Salvar os arquivos no localStorage apenas se não existirem
    Object.entries(mockFiles).forEach(([sessionId, files]) => {
        const existingData = localStorage.getItem(sessionId);
        if (!existingData) {
            localStorage.setItem(
                sessionId,
                JSON.stringify({
                    id: sessionId,
                    files,
                    createdAt: new Date().toISOString(),
                })
            );
            console.log(`✅ Arquivos mock salvos para sessão ${sessionId}`);
        }
    });
}

