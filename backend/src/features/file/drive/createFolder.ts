import { drive } from '../../../config/googleDrive.js';

/**
 * Cria a estrutura de pastas no Google Drive para um cliente ou terapeuta.
 * Estrutura atual:
 *   {nome_completo}-{dataNascimento}/
 *     ├── fotoPerfil.extensão
 *     └── documentos/
 *        // TODO: separar por mês/ano
 */

export async function createFolder(
    ownerType: 'cliente' | 'terapeuta',
    fullName: string,
    birthDate: string,
    rootFolderId: string
): Promise<{
    parentId: string;
    documentosId: string;
}> {
    // Normaliza dados
    const sanitizedName = sanitizeFolderName(fullName);
    const sanitizedDate = sanitizeFolderName(birthDate);
    const folderName = `${sanitizedName}-${sanitizedDate}`;

    // Localiza pasta principal (clientes ou terapeutas)
    const ownerFolderId = await getOrCreateFolder(ownerType === 'cliente' ? 'clientes' : 'terapeutas', rootFolderId);

    // Cria (ou encontra) pasta do usuário
    const parentId = await getOrCreateFolder(folderName, ownerFolderId);

    // A foto de perfil fica diretamente na pasta do cliente (sem subpasta)

    // Subpasta para documentos
    const documentosId = await getOrCreateFolder('documentos', parentId);

    // TODO: criar subpastas por mês/ano em documentos
    
    return { parentId, documentosId };
}

/** Cria uma pasta no Drive (ou retorna a existente) */
async function getOrCreateFolder(name: string, parentId: string): Promise<string> {
    const query = `name = '${name}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const existing = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });

    if (existing.data.files?.length) {
        return existing.data.files[0]!.id!;
    }

    const folder = await drive.files.create({
        requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        },
        fields: 'id',
        supportsAllDrives: true,
    });

    return folder.data.id!;
}

/** Remove caracteres proibidos no Drive */
function sanitizeFolderName(value: string): string {
    return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\s-]/g, '') // remove símbolos
    .replace(/\s+/g, '_') // troca espaço por underline
    .trim();
}