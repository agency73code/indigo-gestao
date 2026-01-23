import type { Response } from "express";
import { AppError } from "../../../errors/AppError.js";
import { asciiFallbackFilename } from "../../../utils/asciiFallbackFilename.js";
import { sanitizeUtf8Filename } from "../../../utils/sanitizeUtf8Filename.js";
import type { dbFileType } from "../types/files.types.js";
import { getFileStreamFromR2 } from "./getFileStream.js";

export async function streamFileDownload(
    res: Response,
    dbFile: dbFileType
): Promise<void> {
    const { metadata, stream } = await getFileStreamFromR2(dbFile.storage_id);

    if (!stream) {
        throw new AppError(
            'R2_STREAM_FAILED',
            'Falha ao obter stream do arquivo',
            502
        );
    }

    const mimeType = 
        dbFile.mime_type ??
        metadata.mimeType ??
        'application/octet-stream';

    const desiredName = sanitizeUtf8Filename(dbFile.name ?? metadata.name ?? 'download');
    const asciiName = asciiFallbackFilename(desiredName);

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(desiredName)}`
    );

    // erro de stream: encerra a resposta sem tentar setar status depois que começou
    stream.on('error', (err: unknown) => {
        console.error('[downloadArquivoById] stream error', err);
        res.destroy(err as Error);
    });

    stream.pipe(res);
}