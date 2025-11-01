import { createFolder } from "./drive/createFolder.js";
import { uploadFile } from "./drive/uploadFile.js";
import { prisma } from "../../config/database.js";
import { drive } from "../../config/googleDrive.js";

type OwnerType = 'cliente' | 'terapeuta';

interface UploadInput {
    ownerType: OwnerType;
    ownerId: string;
    fullName: string;
    birthDate: string;
    documentType: string;
    file: Express.Multer.File;
}

interface UploadResult {
    id: string;
    storageId: string;
    tipo_documento: string;
    nome: string;
    tamanho: number;
    tipo_conteudo: string;
    data_envio: string;
    webViewLink?: string | undefined;
}

/**
 * Faz o upload de um arquivo para o Drive e registra no banco de dados.
 */
export async function uploadAndPersistFile(input: UploadInput & { folderIds?: { parentId: string; documentosId: string } }): Promise<UploadResult> {
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!rootFolderId) {
        throw new Error('Pasta raiz do Google Drive não configurada (GOOGLE_DRIVE_FOLDER_ID).');
    }

    // Cria (ou encontra) a estrutura de pastas
    const { parentId, documentosId } = input.folderIds
        ? input.folderIds
        : await createFolder(
            input.ownerType,
            input.fullName,
            input.birthDate,
            rootFolderId
        );

    // Faz upload do arquivo para a subpasta 'documentos'
    const targetFolderId =
        input.documentType === 'fotoPerfil' ? parentId : documentosId;

    const driveMeta = await uploadFile(input.documentType, input.file, targetFolderId);

    // Persiste metadados no banco
    const record = await persistFileRecord({
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        tipo: input.documentType,
        storageId: driveMeta.id,
        mimeType: input.file.mimetype,
        size: input.file.size,
    });

    return {
        id: record.id.toString(),
        storageId: record.arquivo_id!,
        tipo_documento: record.tipo!,
        nome: record.tipo ?? driveMeta.name,
        tamanho: Number(record.tamanho ?? input.file.size),
        tipo_conteudo: record.mime_type ?? input.file.mimetype,
        data_envio: (record.data_upload ?? new Date()).toISOString(),
        webViewLink: driveMeta.webViewLink,
    };
}

/** Persiste o registro do arquivo no banco via Prisma */
async function persistFileRecord({
    ownerType,
    ownerId,
    tipo,
    storageId,
    mimeType,
    size,
}: {
    ownerType: OwnerType;
    ownerId: string;
    tipo: string;
    storageId: string;
    mimeType: string;
    size: number;
}) {
    const where =
        ownerType === 'cliente'
        ? { clienteId: ownerId, tipo }
        : { terapeutaId: ownerId, tipo };

    const existing = await prisma.arquivos.findFirst({ where });

    const data = {
        tipo,
        arquivo_id: storageId,
        mime_type: mimeType,
        tamanho: size,
        data_upload: new Date(),
    };

    if (existing) {
        return prisma.arquivos.update({
            where: { id: existing.id },
            data,
        });
    }

    const createData =
        ownerType === 'cliente'
        ? { ...data, cliente: { connect: { id: ownerId } } }
        : { ...data, terapeuta: { connect: { id: ownerId } } };

    return prisma.arquivos.create({ data: createData });
}

export async function listFiles(ownerType: 'cliente' | 'terapeuta', ownerId: string) {
    const where = ownerType === 'cliente' ? { clienteId: ownerId } : { terapeutaId: ownerId };
    const records = await prisma.arquivos.findMany({ where, orderBy: { data_upload: 'desc' } });

    return records.map((r) => ({
        id: r.id.toString(),
        storageId: r.arquivo_id ?? '',
        tipo_documento: r.tipo ?? 'documento',
        nome: r.tipo ?? r.arquivo_id ?? `Arquivo ${r.id}`,
        tamanho: Number(r.tamanho ?? 0),
        tipo_conteudo: r.mime_type ?? 'application/octet-stream',
        data_envio: r.data_upload?.toISOString() ?? new Date().toISOString(),
        webViewLink: r.arquivo_id
            ? `https://drive.google.com/file/d/${r.arquivo_id}/view?usp=drivesdk`
            : undefined,
    }));
}

/** Busca um arquivo pelo ID (banco) */
export async function findFileById(id: number) {
    return prisma.arquivos.findUnique({ where: { id } });
}

/** Exclui um arquivo do Google Drive */
export async function deleteFromDrive(fileId: string) {
    try {
        await drive.files.delete({
            fileId,
            supportsAllDrives: true,
        });
    } catch (error) {
        console.warn(`⚠️ Falha ao excluir arquivo no Drive (id: ${fileId})`, error);
    }
}

/** Remove o registro do banco */
export async function deleteFromDatabase(id: number) {
    await prisma.arquivos.delete({ where: { id } });
}