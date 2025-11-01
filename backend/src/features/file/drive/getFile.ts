import { drive } from '../../../config/googleDrive.js';
import { Readable } from 'stream';

/**
 * Busca um arquivo no Google Drive.
 * Retorna metadados e um stream para leitura.
 */
export async function getFile(fileId: string) {
    if (!fileId) {
        throw new Error('O ID do arquivo é obrigatório.');
    }

    // Obtém metadados
    const metadata = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, webViewLink',
        supportsAllDrives: true,
    });

    // Abre stream de leitura (download)
    const response = await drive.files.get(
        {
            fileId,
            alt: 'media',
            supportsAllDrives: true,
        },
        { responseType: 'stream' }
    );

    // O corpo é um stream de leitura do conteúdo do arquivo
    const stream = response.data as Readable;

    return {
        id: metadata.data.id!,
        name: metadata.data.name!,
        mimeType: metadata.data.mimeType!,
        size: Number(metadata.data.size ?? 0),
        webViewLink: metadata.data.webViewLink ?? undefined,
        stream,
    };
}