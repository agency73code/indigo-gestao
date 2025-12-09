import type { AreaType } from "@/contexts/AreaContext";

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue>;

export type SaveSessionPayload<TAttempt> = {
    patientId: string;
    programId: string;
    attempts: TAttempt[];
    area: AreaType;
    notes?: string;
    files?: SessionFile[];
}

type SessionFile = {
    id: string;
    file: File;
    name: string;
    preview?: string;
};