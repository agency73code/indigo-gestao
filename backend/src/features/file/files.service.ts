import { createFolder } from './r2/createFolder.js';
import { prisma } from '../../config/database.js';
import { s3 } from '../../config/r2.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import type { FileForDownload } from './types/files.types.js';
import { AppError } from '../../errors/AppError.js';
import { getVisibilityScope } from '../../utils/visibilityFilter.js';

type OwnerType = 'cliente' | 'terapeuta';

interface UploadInput {
    ownerType: OwnerType;
    ownerId: string;
    fullName: string;
    birthDate: string;
    documentType: string;
    documentDescription?: string | null;
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
    descricao_documento?: string | null;
}

/**
 * Upload para o Cloudflare R2 + persistência no banco.
 */
export async function uploadAndPersistFile(
    input: UploadInput & { folderIds?: { parentPath: string; documentosPath: string } },
): Promise<UploadResult> {
    const bucket = process.env.R2_BUCKET;
    if (!bucket) {
        throw new Error('Bucket R2 não configurado (R2_BUCKET).');
    }

    // Normaliza descrição
    const rawDesc = input.documentDescription?.trim();
    const normalizedDescription = rawDesc && rawDesc.length > 0 ? rawDesc : null;

    // Gera caminhos do usuário
    const folderPaths = input.folderIds
        ? input.folderIds
        : await createFolder(input.ownerType, input.fullName, input.birthDate);

    const { parentPath, documentosPath } = folderPaths;

    // Identifica destino da key final
    const targetPath = input.documentType === 'fotoPerfil' ? parentPath : documentosPath;

    // Determina o nome do arquivo
    const ext = path.extname(input.file.originalname || '').toLowerCase() || '';

    const driveLabel =
        normalizedDescription && input.documentType === 'outros'
            ? `${input.documentType}-${normalizedDescription}`
            : input.documentType;

    const finalName = `${driveLabel}${ext}`;

    // Key do R2 = prefixo (pasta virtual) + nome do arquivo
    const storageKey = `${targetPath}/${finalName}`;

    // Upload para o R2 (SDK v3)
    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: storageKey,
            Body: input.file.buffer,
            ContentType: input.file.mimetype,
        }),
    );

    // Persiste metadados no Banco
    const record = await persistFileRecord({
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        tipo: input.documentType,
        descricaoDocumento: normalizedDescription,
        storageId: storageKey, // <- chave do R2 agora!
        mimeType: input.file.mimetype,
        size: input.file.size,
    });

    return {
        id: record.id.toString(),
        storageId: record.arquivo_id!,
        tipo_documento: record.tipo!,
        nome: record.descricao_documento ?? record.tipo ?? finalName,
        tamanho: Number(record.tamanho ?? input.file.size),
        tipo_conteudo: record.mime_type ?? input.file.mimetype,
        data_envio: (record.data_upload ?? new Date()).toISOString(),
        webViewLink: undefined,
        descricao_documento: record.descricao_documento ?? normalizedDescription,
    };
}

/** Persiste o registro do arquivo no banco via Prisma */
async function persistFileRecord({
    ownerType,
    ownerId,
    tipo,
    descricaoDocumento,
    storageId,
    mimeType,
    size,
}: {
    ownerType: OwnerType;
    ownerId: string;
    tipo: string;
    descricaoDocumento: string | null;
    storageId: string;
    mimeType: string;
    size: number;
}) {
    const whereBase = ownerType === 'cliente' ? { clienteId: ownerId } : { terapeutaId: ownerId };

    const where = {
        ...whereBase,
        tipo,
        descricao_documento: descricaoDocumento,
    };

    const existing = await prisma.arquivos.findFirst({ where });

    const data = {
        tipo,
        descricao_documento: descricaoDocumento,
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
        nome: r.descricao_documento ?? r.tipo ?? r.arquivo_id ?? `Arquivo ${r.id}`,
        tamanho: Number(r.tamanho ?? 0),
        tipo_conteudo: r.mime_type ?? 'application/octet-stream',
        data_envio: r.data_upload?.toISOString() ?? new Date().toISOString(),
        webViewLink: undefined,
        descricao_documento: r.descricao_documento ?? undefined,
    }));
}

/** Busca um arquivo pelo ID (banco) */
export async function findFileById(id: string) {
    return prisma.arquivos.findFirst({ where: { arquivo_id: id } });
}

export async function findFileByStorageId(storageId: string) {
    return prisma.anamnese_arquivo_exame_previo.findFirst({ where: { caminho: storageId } });
}

/** Exclui um arquivo do R2 */
export async function deleteFromR2(storageId: string) {
    const bucket = process.env.R2_BUCKET;
    if (!bucket) {
        throw new Error('R2_BUCKET não configurado.');
    }

    try {
        await s3.send(
            new DeleteObjectCommand({
                Bucket: bucket,
                Key: storageId,
            }),
        );
    } catch (error) {
        console.warn(`Falha ao excluir arquivo no R2 (key: ${storageId})`, error);
    }
}

/** Remove o registro do banco */
export async function deleteFromDatabase(id: number) {
    await prisma.arquivos.delete({ where: { id } });
}

export async function findByIdForDownload(
    fileId: number,
    userId: string,
): Promise<FileForDownload | null> {
    const file = await prisma.arquivos.findUnique({
        where: { id: fileId },
        select: {
            id: true,
            arquivo_id: true,
            mime_type: true,
            descricao_documento: true,
            clienteId: true,
            terapeutaId: true,
        },
    });

    if (!file) return null;

    if (!file.arquivo_id) {
        throw new AppError('FILE_NO_STORAGE', 'Arquivo sem referência de storage', 409);
    }

    const visibility = await getVisibilityScope(userId);

    // arquivo do CLIENTE
    if (file.clienteId) {
        if (file.clienteId === userId) {
            return {
                id: file.id,
                storage_id: file.arquivo_id,
                mime_type: file.mime_type,
                nome: file.descricao_documento,
            };
        }

        if (visibility.scope === 'none') {
            throw new AppError('FORBIDDEN', 'Sem permissão para baixar este arquivo', 403);
        }

        const now = new Date();

        const link = await prisma.terapeuta_cliente.findFirst({
            where: {
                cliente_id: file.clienteId,
                status: 'active',
                data_inicio: { lte: now },
                OR: [
                    { data_fim: null }, 
                    { data_fim: { gt: now } }
                ],
                ...(visibility.scope === 'partial'
                    ? { terapeuta_id: { in: visibility.therapistIds } }
                    : {}),
            },
            select: { id: true },
        });

        if (!link) {
            throw new AppError('FORBIDDEN', 'Sem permissão para baixar este arquivo', 403);
        }

        return {
            id: file.id,
            storage_id: file.arquivo_id,
            mime_type: file.mime_type,
            nome: file.descricao_documento,
        };
    }

    if (file.terapeutaId) {
        const allowed =
            visibility.scope === 'all' ||
            (visibility.scope === 'partial' && visibility.therapistIds.includes(file.terapeutaId));

        if (!allowed) {
            throw new AppError('FORBIDDEN', 'Sem permissão para baixar este arquivo', 403);
        }

        return {
            id: file.id,
            storage_id: file.arquivo_id,
            mime_type: file.mime_type,
            nome: file.descricao_documento,
        };
    }

    // Se não tem dono definido, bloqueia (ou trata como inconsistente)
    throw new AppError('FILE_OWNER_MISSING', 'Arquivo sem clienteId/terapeutaId', 409);
}