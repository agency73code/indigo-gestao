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

export const VIEW_BY = {
    PATIENT: 'patient',
    THERAPIST: 'therapist',
    SUPERVISION: 'supervision',
} as const;

export const STATUS = {
    ALL: 'all',
    ACTIVE: 'active',
    ENDED: 'ended',
    ARCHIVED: 'archived',
} as const;

export const ORDER_BY = {
    RECENT: 'recent',
    OLDEST: 'oldest',
} as const;

export type LinkFilters = {
    viewBy?: (typeof VIEW_BY)[keyof typeof VIEW_BY] | undefined;
    status?: (typeof STATUS)[keyof typeof STATUS] | undefined;
    orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY] | undefined;
    q?: string | undefined;
};
