export type Patient = {
    id: string;
    name: string;
    guardianName?: string | null;
    age?: number;
    photoUrl?: string | null;
};

export type ProgramStatus = 'active' | 'archived';

export type ProgramListItem = {
    id: string;
    title?: string | null;
    objective?: string | null;
    status: ProgramStatus;
    lastSession?: string | null; // ISO
    patientId: string;
    patientName?: string;
};

export type SearchAndFiltersState = {
    q: string;
    status: 'active' | 'archived' | 'all';
    sort: 'recent' | 'alphabetic';
};
