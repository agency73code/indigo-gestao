export type createOCP = {
    clientId: string;
    therapistId: string;
    name: string | null;
    goalTitle: string;
    goalDescription?: string | null;
    criteria?: string | null;
    notes?: string | null;
    stimuli: {
        label: string;
        description?: string;
        active: boolean;
        order: number;
    }[];
}

export type getOCP = {
    id: string;
    name?: string | null;
    patientId: string;
    patientName: string;
    patientGuardian?: string | null;
    patientAge?: number | null;
    patientPhotoUrl?: string | null;
    therapistId: string;
    therapistName: string;
    createdAt: string; // ISO
    goalTitle: string;
    goalDescription?: string | null;
    stimuli: { 
        id: string; 
        order: number; 
        label: string; 
        description?: string | null; 
        active: boolean 
    }[];
    status: 'active' | 'archived';
}