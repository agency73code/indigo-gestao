import type { Request } from 'express';

/**
 * Coleta arquivos enviados via Multer.
 * Suporta tanto `upload.single()` quanto `upload.fields()`.
 *
 * Retorna uma lista padronizada no formato:
 *   [{ file: Express.Multer.File, documentType: string | undefined }]
 */

export function collectIncomingFiles(req: Request, defaultType?: string) {
    const collected: Array<{ file: Express.Multer.File; documentType: string | undefined }> = [];

    // Caso seja um upload single (req.file)
    const single = (req as Request & { file?: Express.Multer.File }).file;
    if (single) {
        collected.push({ file: single, documentType: defaultType });
        return collected;
    }

    // Caso seja upload múltiplo (req.files)
    const filesEntry = (req as Request & { files?: unknown }).files;
    if (!filesEntry) {
        return collected;
    }

    // Se for um array direto
    if (Array.isArray(filesEntry)) {
        for (const file of filesEntry) {
            collected.push({ file, documentType: defaultType });
        }
        return collected;
    }

    // Se for um objeto com campos nomeados (upload.fields)
    const files = filesEntry as Record<string, Express.Multer.File[] | undefined>;
    for (const [fieldName, list] of Object.entries(files)) {
        for (const file of list ?? []) {
            collected.push({ file, documentType: fieldName || defaultType });
        }
    }

    return collected;
}