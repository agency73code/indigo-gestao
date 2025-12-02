export type ReportType = 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'custom';
export type ReportStatus = 'draft' | 'final' | 'archived';

export interface StructuredReportData {
    filters: Record<string, unknown>;
    generatedData: Record<string, unknown>;
}

export interface SavedReport {
    id: string;
    title: string;
    type: ReportType;
    status: ReportStatus;
    area: string;
    patientId: string;
    therapistId: string;
    periodStart: string;
    periodEnd: string;
    createdAt: string;
    updatedAt: string;
    filters: Record<string, unknown>;
    generatedData: Record<string, unknown>;
    clinicalObservations?: string;
    pdfUrl?: string;
    pdfFilename?: string;
    driveFolderPath?: string;
    patient?: {
        id: string;
        nome?: string | null;
        cpf?: string | null;
        dataNascimento?: Date | string | null;
    };
    therapist?: {
        id: string;
        nome: string;
        email: string;
        email_indigo: string;
    };
}

export interface ReportListFilters {
    patientId?: string;
    therapistId?: string;
    area?: string;
    startDate?: Date;
    endDate?: Date;
    status?: ReportStatus;
    type?: ReportType;
    restrictToTherapistId?: string;
}