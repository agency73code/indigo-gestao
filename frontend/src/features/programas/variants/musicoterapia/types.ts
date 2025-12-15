// Tipos específicos da variação Musicoterapia (MUSI)
// Estende tipos base sem duplicar

import type { SessionState } from '../../nova-sessao/types';
import { MUSI_AREA_ID } from './constants';

// Re-exportar tipos base para facilitar imports
export type { 
    Patient, 
    ProgramDetail, 
    ProgramListItem 
} from '../../nova-sessao/types';

// Resultado da execução do objetivo (MUSI específico)
export type MusiAchieved = 'sim' | 'nao' | 'parcial' | 'nao_aplica';

// Payload da sessão MUSI (estende SessionState)
export interface MusiSessionPayload extends Omit<SessionState, 'attempts' | 'summary'> {
    area: typeof MUSI_AREA_ID; // 'musicoterapia'
    goalTitle: string;               // título do objetivo trabalhado
    achieved: MusiAchieved;          // Sim/Não/Parcial/N.A.
    frequency?: number | null;       // ≥ 0 (vezes)
    durationMin?: number | null;     // ≥ 0 (minutos)
    performanceNotes: string;        // descrição do desempenho (mín. 10 chars)
    clinicalNotes?: string | null;   // observações clínicas opcionais
    attachments?: (File | string)[]; // URLs ou arquivos
    documentType?: string | null;    // Laudo, Avaliação, etc.
    date: string;                    // ISO date
    therapistId?: string | null;     // ID do terapeuta (auto pelo login)
}

// Response do save
export interface MusiSessionResponse {
    id: string;
    success: boolean;
    message?: string;
}

// ============ CONSULTA DE SESSÕES ============

// Item de sessão MUSI na listagem
export interface MusiSessionListItem {
    id: string;
    date: string; // ISO date
    patientId: string;
    patientName: string;
    therapistId: string;
    therapistName: string;
    programName: string;
    goalTitle: string;
    achieved: MusiAchieved;
    frequency?: number | null;
    durationMin?: number | null;
}

// Detalhe completo da sessão MUSI
export interface MusiSessionDetail {
    id: string;
    date: string; // ISO date
    patientId: string;
    patientName: string;
    patientAge?: number;
    patientPhotoUrl?: string;
    patientGuardianName?: string;
    therapistId: string;
    therapistName: string;
    programId: string;
    programName: string;
    goalTitle: string;
    goalDescription?: string;
    // Dados específicos de MUSI
    achieved: MusiAchieved;
    frequency?: number | null;
    durationMin?: number | null;
    performanceNotes: string;
    clinicalNotes?: string | null;
    // Arquivos anexados
    attachments?: Array<{
        url: string;
        name: string;
        type?: string;
    }>;
}

// ============ DETALHE DO PROGRAMA - RESUMO DE ATIVIDADES ============

/**
 * Resumo de desempenho por atividade (objetivo específico) em uma sessão
 * 
 * 🔧 NOTA: Usa camelCase para contadores (convenção JavaScript)
 * A conversão de/para API (kebab-case) é feita nos services
 */
export type MusiActivitySummary = {
    activityId: string;
    activityName: string;
    counts: {
        naoDesempenhou: number;      // Mapeado de 'nao-desempenhou' da API
        desempenhouComAjuda: number; // Mapeado de 'desempenhou-com-ajuda' da API
        desempenhou: number;         // Mapeado de 'desempenhou' da API
    };
    total: number;
    durationMinutes?: number | null; // tempo total em minutos
    participacao?: number | null;    // 0-5: nível de participação
    suporte?: number | null;         // 1-5: nível de suporte necessário
    // Status predominante é calculado no componente, não precisa vir do backend
};

// ============ ESTÍMULO/OBJETIVO ESPECÍFICO - MUSICOTERAPIA ============

/**
 * Estrutura do Objetivo Específico de Musicoterapia
 * Baseado no modelo do programa real de Musicoterapia
 * 
 * Campos:
 * - objetivo: O objetivo geral (ex: "Compreender conceitos")
 * - objetivoEspecifico: O objetivo específico (ex: "Identificar direita e esquerda")
 * - metodos: Método utilizado (ex: "Recriação – Jogos e atividades musicais")
 * - tecnicasProcedimentos: Técnicas e procedimentos detalhados
 */
export interface MusiStimulus {
    id?: string;
    order: number;
    active: boolean;
    objetivo: string;                    // Campo "Objetivo" - substitui label
    objetivoEspecifico: string;          // Campo "Objetivo Específico" - substitui description
    metodos: string;                     // Campo "Métodos" - novo
    tecnicasProcedimentos: string;       // Campo "Técnicas/Procedimentos" - novo
}

/**
 * Input para criação/edição de estímulo Musicoterapia
 */
export interface MusiStimulusInput {
    id?: string;
    order: number;
    active: boolean;
    objetivo: string;
    objetivoEspecifico: string;
    metodos: string;
    tecnicasProcedimentos: string;
}

/**
 * Mapper: Converte MusiStimulus para formato de API (stimuli padrão)
 * Usado ao enviar dados para o backend
 */
export function musiStimulusToApi(stimulus: MusiStimulus): {
    id?: string;
    order: number;
    label: string;
    description?: string;
    active: boolean;
    metodos?: string;
    tecnicasProcedimentos?: string;
} {
    return {
        id: stimulus.id,
        order: stimulus.order,
        label: stimulus.objetivo,
        description: stimulus.objetivoEspecifico || undefined,
        active: stimulus.active,
        metodos: stimulus.metodos,
        tecnicasProcedimentos: stimulus.tecnicasProcedimentos,
    };
}

/**
 * Mapper: Converte formato de API para MusiStimulus
 * Usado ao receber dados do backend
 */
export function apiToMusiStimulus(apiStimulus: {
    id?: string;
    order: number;
    label: string;
    description?: string | null;
    active: boolean;
    metodos?: string;
    tecnicasProcedimentos?: string;
}): MusiStimulus {
    return {
        id: apiStimulus.id,
        order: apiStimulus.order,
        active: apiStimulus.active,
        objetivo: apiStimulus.label,
        objetivoEspecifico: apiStimulus.description || '',
        metodos: apiStimulus.metodos || '',
        tecnicasProcedimentos: apiStimulus.tecnicasProcedimentos || '',
    };
}
