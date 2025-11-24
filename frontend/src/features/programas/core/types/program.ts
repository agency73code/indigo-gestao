/**
 * Tipos base para Programas (agnóstico de especialidade)
 */

export type ProgramStatus = 'active' | 'archived';

export type Patient = {
    id: string;
    name: string;
    guardianName?: string | null;
    age?: number | null;
    photoUrl?: string | null;
};

export type Therapist = { 
    id: string; 
    name: string; 
    photoUrl?: string | null;
    especialidade?: string | null;
};

export type StimulusInput = { 
    id?: string; 
    label: string; 
    description?: string;
    active: boolean; 
    order: number;
};

export type CreateProgramInput = {
    patientId: string;
    therapistId: string;
    name?: string | null;
    goalTitle: string;
    goalDescription?: string | null;
    shortTermGoalDescription: string | null;
    stimuli: StimulusInput[];
    stimuliApplicationDescription?: string | null;
    criteria?: string | null;
    currentPerformanceLevel?: string | null;
    notes?: string | null;
    createdAt?: string;
    prazoInicio?: string;
    prazoFim?: string;
};

export type ValidationErrors = {
    patientId?: string;
    therapistId?: string;
    programName?: string;
    goalTitle?: string;
    goalDescription?: string;
    stimuli?: string;
    general?: string;
    prazoInicio?: string;
    prazoFim?: string;
};

export type FormState = {
    patient: Patient | null;
    therapist: Therapist | null;
    programName: string;
    goalTitle: string;
    goalDescription: string;
    shortTermGoalDescription: string;
    stimuli: StimulusInput[];
    stimuliApplicationDescription: string;
    criteria: string;
    currentPerformanceLevel: string;
    notes: string;
    createdAt: string;
    prazoInicio: string;
    prazoFim: string;
};

/**
 * Configuração para páginas base de programas
 */
export interface BaseProgramPageConfig {
    // Textos do cabeçalho
    pageTitle: string;
    
    // Labels de campos
    labels: {
        programName: string;
        goalTitle: string;
        goalDescription: string;
        shortTermGoal: string;
        stimuli: string;
        stimuliApplication: string;
        criteria: string;
        notes: string;
        patient: string;
        therapist: string;
        dateStart: string;
        dateEnd: string;
    };
    
    // Placeholders
    placeholders: {
        programName: string;
        goalTitle: string;
        goalDescription: string;
        shortTermGoal: string;
        stimuliApplication: string;
        criteria: string;
        notes: string;
    };
    
    // Textos de botões
    buttons: {
        save: string;
        saveAndStart: string;
        cancel: string;
    };
    
    // Mensagens
    messages: {
        saveSuccess: string;
        saveError: string;
        confirmLeave: string;
    };

    // Features opcionais
    features?: {
        showCriteria?: boolean;
        showStimulusDescription?: boolean;
        showStimuliApplication?: boolean;
        showCurrentPerformance?: boolean;
    };

    // Títulos customizados das seções (opcional)
    sectionTitles?: {
        programInfo?: string;
        goal?: string;
        criteria?: string;
        currentPerformance?: string;
        stimuli?: string;
        notes?: string;
    };
}
