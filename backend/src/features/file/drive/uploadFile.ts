import { drive } from '../../../config/googleDrive.js'
import { Readable } from 'stream';

/**
 * Faz upload (ou atualização) de um arquivo no Google Drive.
 * O arquivo é armazenado dentro da subpasta "documentos" do cliente/terapeuta.
 *
 * Estrutura prevista:
 *   {nome_completo}-{dataNascimento}/
 *     ├── fotoPerfil.extensão
 *     └── documentos/
 *         ├── comprovanteEndereco.pdf
 *         ├── ...
 *         // TODO: criar separação por mês/ano
 */

export async function uploadFile(
    documentType: string,
    file: Express.Multer.File,
    folderId: string, 
): Promise<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
    webViewLink: string | undefined;
}> {
    const prefix = sanitizeFileName(documentType || 'arquivo');
    const baseName = sanitizeFileName(file.originalname ?? documentType);
    const fileName = `${prefix}_${baseName}`;

    // Verifica se o arquivo já existe na pasta (mesmo nome e pai)
    const existing = await drive.files.list({
        q: `name = '${fileName}' and '${folderId}' in parents and trashed = false`,
        fields: 'files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });

    let fileId: string;

    if (existing.data.files?.length) {
        // Atualiza arquivo existente
        fileId = existing.data.files[0]!.id!;
        await drive.files.update({
            fileId,
            media: {
                mimeType: file.mimetype,
                body: Readable.from(file.buffer),
            },
            supportsAllDrives: true,
        });
    } else {
        // Cria novo arquivo
        const res = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
            },
            media: {
                mimeType: file.mimetype,
                body: Readable.from(file.buffer),
            },
            fields: 'id, name, mimeType, size, webViewLink',
            supportsAllDrives: true,
        });
        fileId = res.data.id!;
    }

    const meta = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, webViewLink',
        supportsAllDrives: true,
    });

    return {
        id: meta.data.id!,
        name: meta.data.name!,
        mimeType: meta.data.mimeType!,
        size: Number(meta.data.size ?? file.size),
        webViewLink: meta.data.webViewLink ?? undefined,
    };
}

/** Remove caracteres proibidos ou estranhos no nome do arquivo */
function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}