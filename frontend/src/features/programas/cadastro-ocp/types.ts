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
    stimuli: StimulusInput[]; // pelo menos 1, label não vazio
    criteria?: string | null;
    notes?: string | null;
    createdAt?: string; // preenchido no backend; aqui só exibição
};

// Tipos para validação
export type ValidationErrors = {
    patientId?: string;
    therapistId?: string;
    goalTitle?: string;
    stimuli?: string;
    general?: string;
};

// Estado do formulário
export type FormState = {
    patient: Patient | null;
    therapist: Therapist | null;
    programName: string;
    goalTitle: string;
    goalDescription: string;
    stimuli: StimulusInput[];
    criteria: string;
    notes: string;
    createdAt: string;
};
