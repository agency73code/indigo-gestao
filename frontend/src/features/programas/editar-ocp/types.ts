// Reutilizando tipos do cadastro-ocp
export type { Patient, Therapist, StimulusInput, ProgramStatus } from '../cadastro-ocp/types';

// Importando tipos do detalhe-ocp
export type { ProgramDetail } from '../detalhe-ocp/types';

// Tipo específico para edição
export type UpdateProgramInput = {
    id: string;
    name?: string | null;
    goalTitle?: string;
    goalDescription?: string | null;
    stimuli?: { 
        id?: string; 
        label: string; 
        description?: string | null; 
        active: boolean; 
        order: number 
    }[];
    criteria?: string | null;
    notes?: string | null;
    status?: 'active' | 'archived';
};

// Validação
export type ValidationErrors = {
    goalTitle?: string;
    stimuli?: { [index: number]: { label?: string; description?: string } };
    criteria?: string;
    notes?: string;
    general?: string;
};