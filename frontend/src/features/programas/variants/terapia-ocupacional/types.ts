// Tipos específicos da variação Terapia Ocupacional (TO)
// Estende tipos base sem duplicar

import type { SessionState } from '../../nova-sessao/types';

// Re-exportar tipos base para facilitar imports
export type { 
    Patient, 
    ProgramDetail, 
    ProgramListItem 
} from '../../nova-sessao/types';

// Resultado da execução do objetivo (TO específico)
export type ToAchieved = 'sim' | 'nao' | 'parcial' | 'nao_aplica';

// Payload da sessão TO (estende SessionState)
export interface ToSessionPayload extends Omit<SessionState, 'attempts' | 'summary'> {
    area: 'TO';
    goalTitle: string;               // título do objetivo trabalhado
    achieved: ToAchieved;            // Sim/Não/Parcial/N.A.
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
