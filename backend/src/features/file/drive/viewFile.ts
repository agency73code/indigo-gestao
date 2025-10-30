import { drive } from '../../../config/googleDrive.js';

/**
 * Busca e faz stream de um arquivo diretamente do Google Drive.
 * Retorna um objeto contendo metadados e o stream de leitura.
 */
export async function getFileStream(storageId: string) {
    if (!storageId) {
        throw new Error('storageId é obrigatório');
    }

    // Obtém metadados do arquivo (nome e tipo MIME)
    const meta = await drive.files.get({
        fileId: storageId,
        fields: 'id, name, mimeType, size',
        supportsAllDrives: true,
    });

    // Obtém o conteúdo do arquivo em modo stream
    const stream = await drive.files.get(
        {
            fileId: storageId,
            alt: 'media',
            supportsAllDrives: true,
        },
        { responseType: 'stream' },
    );

    return {
        metadata: {
            id: meta.data.id!,
            name: meta.data.name || 'arquivo',
            mimeType: meta.data.mimeType || 'application/octet-stream',
            size: Number(meta.data.size ?? 0),
        },
        stream: stream.data,
    };
}