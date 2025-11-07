export type { Patient, Therapist, StimulusInput, ProgramStatus } from '../cadastro-ocp/types';
export type { ProgramDetail } from '../detalhe-ocp/types';

export type UpdateProgramInput = {
    id: string;
    name?: string | null;
    goalTitle?: string;
    goalDescription?: string | null;
    stimuliApplicationDescription?: string | null;
    shortTermGoalDescription: string | null;
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
    prazoInicio?: string; // Data de início do programa
    prazoFim?: string; // Data de fim do programa
};

export type ValidationErrors = {
    goalTitle?: string;
    shortTermGoalDescription?: string;
    stimuliApplicationDescription?: string;
    stimuli?: { [index: number]: { label?: string; description?: string } };
    criteria?: string;
    notes?: string;
    general?: string;
};