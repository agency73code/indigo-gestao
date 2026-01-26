import { AppError } from "../errors/AppError.js";

export type ParsedFile = {
    file_id: string;
    name: string;
    original_name: string;
    mime_type: string;
    size: number;
    buffer: Buffer;
}

export function parseMultipartFiles(
    files: Express.Multer.File[] | undefined,
    fileNames: Record<string, string> | undefined,
): ParsedFile[] {
    if (!files || files.length === 0) return [];

    return files.map((file) => {
        const match = /^files\[(.+)\]$/.exec(file.fieldname);

        if (!match) {
            throw new AppError(
                'INVALID_FILE',
                'Campo de arquivo inválido', 
                400
            );
        }

        const fileId = match[1];
        if (!fileId) {
            throw new AppError(
                'INVALID_FILE',
                'ID do arquivo inválido',
                400
            );
        }

        const logicalName = fileNames ? fileNames[fileId] : undefined;

        if (!logicalName) {
            throw new AppError(
                'INVALID_FILE_NAME',
                `Nome do arquivo não informado (${file.originalname})`,
                400
            );
        }

        return {
            file_id: fileId,
            name: logicalName,
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            buffer: file.buffer,
        };
    });
}