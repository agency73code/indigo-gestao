export type ProgramStatus = 'active' | 'archived';

export type Patient = {
    id: string;
    name: string;
    guardianName?: string | null;
    age?: number | null;
    photoUrl?: string | null; // exibir avatar (placeholder se vazio)
};

export type Therapist = { 
    id: string; 
    name: string; 
    photoUrl?: string | null;
};

export type StimulusInput = { 
    id?: string; 
    label: string; 
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
    stimuli: StimulusInput[]; // pelo menos 1, label não vazio
    stimuliApplicationDescription?: string | null; // Descrição geral de aplicação dos estímulos
    criteria?: string | null;
    notes?: string | null;
    createdAt?: string; // preenchido no backend; aqui só exibição
    prazoInicio?: string; // Data de início do programa
    prazoFim?: string; // Data de fim do programa
};

// Tipos para validação
export type ValidationErrors = {
    patientId?: string;
    therapistId?: string;
    goalTitle?: string;
    stimuli?: string;
    general?: string;
    prazoFim?: string;
};

// Estado do formulário
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
    notes: string;
    createdAt: string;
    prazoInicio: string;
    prazoFim: string;
};
