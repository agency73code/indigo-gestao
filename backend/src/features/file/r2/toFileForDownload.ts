import type { FileForDownload } from "../types/files.types.js";

export function toFileForDownload(file: {
    id: number;
    storage_id: string;
    mime_type: string | null;
    document_description: string | null;
}): FileForDownload {
    return {
        id: file.id,
        storage_id: file.storage_id,
        mime_type: file.mime_type,
        name: file.document_description,
    }
}