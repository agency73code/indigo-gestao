export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending';

export type SessionType =
    | 'Consulta Individual'
    | 'Terapia em Grupo'
    | 'Consulta Familiar'
    | 'Avaliação Inicial';

export interface SessionRow {
    id: string;
    patientName: string;
    therapistName: string;
    therapistSpecialty?: string;
    sessionType: SessionType;
    status: SessionStatus;
    dateTime: string;
    modality?: 'online' | 'presencial';
    ocpActive: number;
    stimuliAccuracy: number;
}
