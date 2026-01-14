const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024;
const FILE_FIELD_REGEX = /^files\[(?<id>[0-9a-fA-F-]{36})\]$/;

export type ParsedAtaAnexo = {
    external_id: string;
    nome: string | null;
    original_nome: string;
    mime_type: string;
    tamanho: number;
    file: Express.Multer.File;
};

function isAllowedMime(mime: string): boolean {
    if (mime.startsWith('image/')) return true;
    if (mime.startsWith('video/')) return true;

    const allowed = new Set<string>([
        'application/pdf',

        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',

        'text/plain',
    ]);

    return allowed.has(mime);
}

function getFileDisplayNameFromBody(body: unknown, id: string): string | null {
    if (!body || typeof body !== 'object') return null;

    const key = `fileNames[${id}]`;
    const v = (body as Record<string, unknown>)[key];

    if (typeof v !== 'string') return null;

    const trimmed = v.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function parseAtaAnexos(
    files: Express.Multer.File[],
    body: unknown,
): ParsedAtaAnexo[] {
    if (!Array.isArray(files) || files.length === 0) return [];

    const anexos: ParsedAtaAnexo[] = [];

    for (const file of files) {
        const match = FILE_FIELD_REGEX.exec(file.fieldname);
        if (!match?.groups?.id) {
            continue;
        }

        const external_id = match.groups.id;

        if (!isAllowedMime(file.mimetype)) {
            throw new Error(`Tipo de arquivo não permitido: ${file.mimetype}`);
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new Error(`Arquivo excede 200MB: ${file.originalname}`);
        }

        anexos.push({
            external_id,
            nome: getFileDisplayNameFromBody(body, external_id),
            original_nome: file.originalname,
            mime_type: file.mimetype,
            tamanho: file.size,
            file,
        });
    }

    return anexos;
}