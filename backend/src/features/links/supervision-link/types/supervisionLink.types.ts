export interface CreateSupervisionLinkInput {
    supervisorId: string;
    supervisedTherapistId: string;
    startDate: Date;
    endDate?: Date | null;
    hierarchyLevel?: number;
    supervisionScope?: string;
    notes?: string | null;
}

export interface RawCreateSupervisionLinkInput {
    supervisorId: string;
    supervisedTherapistId: string;
    startDate: string;
    endDate?: string | null;
    hierarchyLevel?: number | string;
    supervisionScope?: string;
    notes?: string | null;
}

export interface UpdateSupervisionLinkInput {
    id: number;
    hierarchyLevel?: number | undefined;
    supervisionScope?: 'direct' | 'team' | undefined;
    startDate?: string | undefined;
    endDate?: string | null | undefined;
    notes?: string | null | undefined;
    status?: 'active' | 'ended' | 'archived' | undefined;
}

export interface EndSupervisionLinkInput {
    id: number;
    endDate: string;
}