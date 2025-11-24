/**
 * Gera a estrutura de "pastas" (prefixos) no R2.
 * 
 * OBS: O R2 não possui pastas reais — apenas keys.
 * Esta função apenas cria os paths corretos com base nas regras existentes.
 */

export async function createFolder(
    ownerType: 'cliente' | 'terapeuta',
    fullName: string,
    birthDate: string
): Promise<{
    parentPath: string;
    documentosPath: string;
    ownerFolderName: string;
}> {
    // Normaliza dados
    const folderName = buildOwnerFolderName(fullName, birthDate);

    // Localiza pasta principal (clientes ou terapeutas)
    const ownerFolderName = ownerType === 'cliente' ? 'clientes' : 'terapeutas';

    // Caminho base do dono
    const parentPath = `${ownerFolderName}/${folderName}`;

    // Subpasta documentos
    const documentosPath = `${parentPath}/documentos`;

    return {
        parentPath,
        documentosPath,
        ownerFolderName: folderName,
    };
}

/** Remove caracteres proibidos */
export function sanitizeFolderName(value: string): string {
    return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\s-]/g, '') // remove símbolos
    .replace(/\s+/g, '_') // troca espaço por underline
    .trim();
}

export function buildOwnerFolderName(fullName: string, birthDate: string): string {
    const sanitizedName = sanitizeFolderName(fullName);
    const sanitizedDate = sanitizeFolderName(birthDate);
    return `${sanitizedName}-${sanitizedDate}`;
}