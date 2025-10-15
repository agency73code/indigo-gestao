import type { Express, Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { Readable } from "stream";
import { drive } from "../config/googleDrive.js";
import { prisma } from "../config/database.js";
import { extension as mimeExt } from "mime-types";

type OwnerType = "cliente" | "terapeuta";

interface NormalizedFileMeta {
  id: string;
  storageId: string;
  tipo_documento: string;
  nome: string;
  tamanho: number;
  tipo_conteudo: string;
  data_envio: string;
}

/**
 * Recupera os arquivos cadastrados para um cliente/terapeuta diretamente do Prisma.
 * A listagem é utilizada pelas telas de consulta para renderizar a DocumentsTable.
 */
export async function listFiles(req: Request, res: Response) {
  const ownerTypeParam = typeof req.query.ownerType === 'string' ? req.query.ownerType : undefined;
  const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;
  if (!isOwnerType(ownerTypeParam) || !ownerId) {
    return res.status(400).json({ error: 'Parâmetros ownerType e ownerId são obrigatórios' });
  }

  try {
    const where: Prisma.arquivosWhereInput =
      ownerTypeParam === 'cliente'
        ? { clienteId: ownerId }
        : { terapeutaId: ownerId };

    const records = await prisma.arquivos.findMany({
      where,
      orderBy: { data_upload: 'desc' },
    });

    const payload: NormalizedFileMeta[] = records.map(mapRecordToResponse);
    return res.json(payload);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return res.status(500).json({ error: 'Falha ao carregar arquivos' });
  }
}

/**
 * Faz upload de um arquivo para o Google Drive e sincroniza os metadados com o banco.
 * Suporta tanto o formato novo (query ownerType/ownerId) quanto o legado baseado apenas em CPF.
 */
export async function uploadFile(req: Request, res: Response) {
  try {
    const ownerTypeFromQuery = typeof req.query.ownerType === 'string' ? req.query.ownerType : undefined;
    const ownerIdFromQuery = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;
    const body = req.body as { cpf?: string; tipo?: string; tipo_documento?: string; ownerType?: string; ownerId?: string };

    const ownerType = isOwnerType(ownerTypeFromQuery)
      ? ownerTypeFromQuery
      : isOwnerType(body.ownerType)
        ? body.ownerType
        : undefined;
    const ownerId = ownerIdFromQuery ?? (typeof body.ownerId === 'string' ? body.ownerId : undefined);

    const availableFiles = collectIncomingFiles(req, body.tipo_documento ?? body.tipo);
    if (availableFiles.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const cpf = await resolveCpf({ ownerType, ownerId, fallbackCpf: body.cpf });
    if (!cpf) {
      return res.status(400).json({ error: 'Não foi possível determinar o CPF do proprietário' });
    }

    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!rootFolderId) {
      return res.status(500).json({ error: 'Pasta raiz do Google Drive não configurada' });
    } 

    const normalizedCpf = normalizeCpf(cpf);
    const uploads: NormalizedFileMeta[] = [];

    // Mantém em cache as pastas para evitar chamadas repetidas ao Drive durante um upload múltiplo.
    const typeFolderCache = new Map<string, string>();

    for (const { file, documentType } of availableFiles) {
      const tipoDocumento = documentType ?? body.tipo_documento ?? body.tipo;
      if (!tipoDocumento) {
        return res.status(400).json({ error: 'Tipo de documento não informado' });
      }

      const typeFolderId = typeFolderCache.get(tipoDocumento) ?? (await getOrCreateTypeFolder(tipoDocumento, rootFolderId));
      typeFolderCache.set(tipoDocumento, typeFolderId);
      const cpfFolderId = await getOrCreateCpfFolder(normalizedCpf, typeFolderId, rootFolderId);
      const storageMeta = await uploadOrUpdateFile(tipoDocumento, normalizedCpf, file, cpfFolderId, rootFolderId);

      let record = null;
      if (ownerType && ownerId) {
        record = await persistFileRecord({
          ownerType,
          ownerId,
          tipo: tipoDocumento,
          storageId: storageMeta.arquivo_id,
          mimeType: file.mimetype,
          size: file.size,
        });
      }

      uploads.push({
        id: record ? record.id.toString() : storageMeta.arquivo_id,
        storageId: storageMeta.arquivo_id,
        tipo_documento: tipoDocumento,
        nome: file.originalname ?? tipoDocumento,
        tamanho: record ? Number(record.tamanho ?? file.size) : file.size,
        tipo_conteudo: record?.mime_type ?? file.mimetype,
        data_envio: (record?.data_upload ?? new Date()).toISOString(),
      });
    }

    return res.json({ arquivos: uploads });
  } catch (error) {
    console.error('Erro upload:', error);
    return res.status(500).json({ error: 'Falha no upload' });
  }
}

/**
 * Remove o registro do arquivo no banco e tenta deletá-lo do Google Drive.
 */
export async function deleteFile(req: Request, res: Response) {
  const rawId = req.params.id;
  if (!rawId) return;
  
  const id = Number.parseInt(rawId, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const existing = await prisma.arquivos.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    if (existing.arquivo_id) {
      try {
        await drive.files.delete({ fileId: existing.arquivo_id, supportsAllDrives: true });
      } catch (error) {
        console.error('Erro ao excluir arquivo:', error);
        return res.status(500).json({ error: 'Falha ao excluir arquivo' });
      }
    }

    await prisma.arquivos.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    return res.status(500).json({ error: 'Falha ao excluir arquivo' });
  }
}

export async function viewFile(req: Request, res: Response) {
  const storageId = req.params.id ?? req.params.storageId;

  if (!storageId) {
    return res.status(400).json({ message: 'File ID obrigatório' });
  }

  try {
    const metadata = await drive.files.get({
      fileId: storageId,
      fields: "mimeType",
      supportsAllDrives: true,
    });

    const file = await drive.files.get(
      { fileId: storageId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" },
    );

    res.setHeader("Content-Type", metadata.data.mimeType || "application/octet-stream");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    file.data.on("error", (err) => {
      console.error("Erro ao streamar arquivo:", err);
      res.sendStatus(500);
    });
    file.data.pipe(res);
  } catch (err) {
    console.error("Erro ao buscar arquivo:", err);
    res.sendStatus(404);
  }
}

export async function downloadFile(req: Request, res: Response) {
  const storageId = req.params.id ?? req.params.storageId;

  if (!storageId) {
    return res.status(400).json({ message: 'File ID obrigatório' });
  }

  try {
    const metadata = await drive.files.get({
      fileId: storageId,
      fields: "name, mimeType",
      supportsAllDrives: true,
    });

    const rawName  = metadata.data.name ?? `arquivo-${storageId}`;
    const mimeType = metadata.data.mimeType ?? "application/octet-stream";
    
    const hasExt = /\.[A-Za-z0-9]{1,10}$/.test(rawName);

    const extFromMime = mimeExt(mimeType) || "bin";
    const finalName = hasExt ? rawName : `${rawName}.${extFromMime}`;

    const file = await drive.files.get(
      { fileId: storageId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" },
    );

    res.setHeader("Content-Type", mimeType);
    const asciiFallback = finalName.normalize('NFKD').replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '\\"');
    const encodedUtf8   = encodeURIComponent(finalName);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedUtf8}`
    );
    file.data.on("error", (err) => {
      console.error("Erro ao streamar arquivo:", err);
      res.sendStatus(500);
    });
    file.data.pipe(res);
  } catch (err) {
    console.error("Erro ao baixar arquivo:", err);
    res.sendStatus(404);
  }
}

function isOwnerType(value: unknown): value is OwnerType {
  return value === 'cliente' || value === 'terapeuta';
}

async function resolveCpf({
  ownerType,
  ownerId,
  fallbackCpf,
}: {
  ownerType?: OwnerType | undefined;
  ownerId?: string | undefined;
  fallbackCpf?: string | undefined;
}) {
  if (fallbackCpf) {
    return fallbackCpf;
  }

  if (!ownerType || !ownerId) {
    return null;
  }

  if (ownerType === 'cliente') {
    const cliente = await prisma.cliente.findUnique({
      where: { id: ownerId },
      select: { cpf: true },
    });
    return cliente?.cpf ?? null;
  }

  const terapeuta = await prisma.terapeuta.findUnique({
    where: { id: ownerId },
    select: { cpf: true },
  });
  return terapeuta?.cpf ?? null;
} 

function collectIncomingFiles(req: Request, defaultType?: string) {
  const collected: Array<{ file: Express.Multer.File; documentType: string | undefined }> = [];

  if (req.file) {
    collected.push({ file: req.file, documentType: defaultType });
    return collected;
  }

  const files = req.file as Record<string, Express.Multer.File[] | undefined> | undefined;
  if (!files) {
    return collected;
  }

  for (const [fieldName, list] of Object.entries(files)) {
    for (const file of list ?? []) {
      collected.push({ file, documentType: fieldName || defaultType });
    }
  }

  return collected;
}

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
  const where: Prisma.arquivosWhereInput =
    ownerType === 'cliente'
      ? { clienteId: ownerId, tipo }
      : { terapeutaId: ownerId, tipo };
  
  const existing = await prisma.arquivos.findFirst({ where });

  const data: Prisma.arquivosUpdateInput = {
    tipo,
    arquivo_id: storageId,
    mime_type: mimeType,
    tamanho: size,
    data_upload: new Date(),
  };

  if (existing) {
    return prisma.arquivos.update({ where: { id: existing.id }, data });
  }

  const createData: Prisma.arquivosCreateInput = {
    tipo,
    arquivo_id: storageId,
    mime_type: mimeType,
    tamanho: size,
    ...(ownerType === 'cliente'
      ? { cliente: { connect: { id: ownerId } } }
      : { terapeuta: { connect: { id: ownerId } } }),
  };

  return prisma.arquivos.create({ data: createData });
}

function mapRecordToResponse(record: {
  id: number;
  tipo: string | null;
  arquivo_id: string | null;
  mime_type: string | null;
  tamanho: number | null;
  data_upload: Date;
}): NormalizedFileMeta {
  return {
    id: record.id.toString(),
    storageId: record.arquivo_id ?? record.id.toString(),
    tipo_documento: record.tipo ?? 'documento',
    nome: record.tipo ?? record.arquivo_id ?? `Arquivo ${record.id}`,
    tamanho: Number(record.tamanho ?? 0),
    tipo_conteudo: record.mime_type ?? "application/octet-stream",
    data_envio: record.data_upload?.toISOString() ?? new Date().toISOString(),
  };
}

async function uploadOrUpdateFile(
  campo: string,
  cpf: string,
  file: Express.Multer.File,
  cpfFolderId: string,
  driveId: string,
) {
  const fileName = `${campo}_${cpf}`;
  const existingFile = await drive.files.list({
    corpora: "drive",
    driveId,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    q: `name = '${fileName}' and '${cpfFolderId}' in parents and trashed = false`,
    fields: "files(id, name, createdTime)",
  });

  let fileId: string;
  if (existingFile.data.files?.length) {
    fileId = existingFile.data.files[0]!.id!;
    await drive.files.update({
      fileId,
      media: { mimeType: file.mimetype, body: Readable.from(file.buffer) },
      supportsAllDrives: true,
    });
  } else {
    const response = await drive.files.create({
      requestBody: { name: fileName, parents: [cpfFolderId] },
      media: { mimeType: file.mimetype, body: Readable.from(file.buffer) },
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });
    fileId = response.data.id!;
  }

  return {
    tipo: campo,
    arquivo_id: fileId,
    mime_type: file.mimetype,
    tamanho: file.size,
    data_upload: new Date().toISOString(),
  };
}

async function getOrCreateTypeFolder(tipo: string, parentFolderId: string) {
  const existing = await drive.files.list({
    corpora: "drive",
    driveId: parentFolderId,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    q: `name = '${tipo}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
  });

  if (existing.data.files?.length) {
    return existing.data.files[0]!.id!;
  }

  const folderResponse = await drive.files.create({
    requestBody: {
      name: tipo,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  return folderResponse.data.id!;
}

async function getOrCreateCpfFolder(normalizedCpf: string, parentFolderId: string, driveId: string) {
  const existing = await drive.files.list({
    corpora: "drive",
    driveId,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    q: `name = '${normalizedCpf}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name, parents)",
  });

  if (existing.data.files?.length) {
    return existing.data.files[0]!.id!;
  }

  const folderResponse = await drive.files.create({
    requestBody: {
      name: normalizedCpf,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  return folderResponse.data.id!;
}

function normalizeCpf(cpf: string): string {
  return cpf.replace(/[^\d]/g, "");
}