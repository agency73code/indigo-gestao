export type ProgramDetail = {
    id: string;
    name?: string | null;
    patientId: string;
    patientName: string;
    patientGuardian?: string | null;
    patientAge?: number | null;
    patientPhotoUrl?: string | null;
    prazoInicio?: string; // ISO
    prazoFim?: string; // ISO
    therapistId: string;
    therapistName: string;
    createdAt: string; // ISO
    goalTitle: string;
    goalDescription?: string | null; // legado: descrição do objetivo (preferir campos específicos)
    longTermGoalDescription?: string | null;
    shortTermGoalDescription?: string | null;
    stimuliApplicationDescription?: string | null;
    stimuli: {
        id: string;
        order: number;
        label: string;
        description?: string | null;
        active: boolean;
    }[];
    criteria?: string | null;
    notes?: string | null;
    status: 'active' | 'archived';
};

export type SessionListItem = {
    id: string;
    date: string; // ISO
    therapistName: string;
    overallScore?: number | null; // acerto geral
    independenceRate?: number | null; // taxa de independência
    preview?: Array<'error' | 'prompted' | 'independent'>; // para LastSessionPreview
};
