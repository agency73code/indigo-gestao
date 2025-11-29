// Tipos específicos da variação Fisioterapia (TO)
// Estende tipos base sem duplicar

import type { SessionState } from '../../nova-sessao/types';
import { FISIO_AREA_ID } from './constants';

// Re-exportar tipos base para facilitar imports
export type { 
    Patient, 
    ProgramDetail, 
    ProgramListItem 
} from '../../nova-sessao/types';

// Resultado da execução do objetivo (TO específico)
export type FisioAchieved = 'sim' | 'nao' | 'parcial' | 'nao_aplica';

// Payload da sessão Fisio (estende SessionState)
export interface FisioSessionPayload extends Omit<SessionState, 'attempts' | 'summary'> {
    area: typeof FISIO_AREA_ID; // 🔧 CORRIGIDO: Usa constante centralizada 'fisioterapia'
    goalTitle: string;               // título do objetivo trabalhado
    achieved: FisioAchieved;            // Sim/Não/Parcial/N.A.
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
export interface ToSessionResponse {
    id: string;
    success: boolean;
    message?: string;
}

// ============ CONSULTA DE SESSÕES ============

// Item de sessão Fisio na listagem
export interface FisioSessionListItem {
    id: string;
    date: string; // ISO date
    patientId: string;
    patientName: string;
    therapistId: string;
    therapistName: string;
    programName: string;
    goalTitle: string;
    achieved: FisioAchieved;
    frequency?: number | null;
    durationMin?: number | null;
}

// Detalhe completo da sessão TO
export interface FisioSessionDetail {
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
    // Dados específicos de TO
    achieved: FisioAchieved;
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
export type FisioActivitySummary = {
    activityId: string;
    activityName: string;
    counts: {
        naoDesempenhou: number;      // Mapeado de 'nao-desempenhou' da API
        desempenhouComAjuda: number; // Mapeado de 'desempenhou-com-ajuda' da API
        desempenhou: number;         // Mapeado de 'desempenhou' da API
    };
    total: number;
    durationMinutes?: number | null; // tempo total em minutos
    // Status predominante é calculado no componente, não precisa vir do backend
};
