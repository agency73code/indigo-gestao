import type { Request, Response } from "express";
import { drive } from "../config/googleDrive.js";
import { Readable } from "stream";

export async function uploadFile(req: Request, res: Response) {
  try {
    const { cpf, tipo } = req.body as { cpf?: string; tipo?: string };
    if (!cpf) return res.status(400).json({ error: "CPF é obrigatório para upload" });
    if (!tipo) return res.status(400).json({ error: "Tipo é obrigatório" });

    const normalizedCpf = normalizeCpf(cpf);
    const rootFolderId  = process.env.GOOGLE_DRIVE_FOLDER_ID!;

    const typeFolderId = await getOrCreateTypeFolder(tipo, rootFolderId);
    const cpfFolderId = await getOrCreateCpfFolder(normalizedCpf, typeFolderId, rootFolderId);

    const files = req.files as Record<string, Express.Multer.File[]>;
    const uploads = [];

    for (const [campo, lista] of Object.entries(files)) {
      for (const file of lista ?? []) {
        const meta = await uploadOrUpdateFile(campo, normalizedCpf, file, cpfFolderId, rootFolderId);
        uploads.push(meta);
      }
    }

    res.json({ arquivos: uploads });
  } catch (err) {
    console.error("Erro upload:", err);
    res.status(500).json({ error: "Falha no upload" });
  }
}

export async function viewImg(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "File ID obrigatório" });

    const metadata = await drive.files.get({
      fileId: id,
      fields: "mimeType",
      supportsAllDrives: true,
    });

    const file = await drive.files.get(
      { fileId: id, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' }
    );

    res.setHeader('Content-Type', metadata.data.mimeType || 'application/octet-stream');
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    file.data.on('error', (err) => {
      console.error('Erro ao streamar arquivo:', err);
      res.sendStatus(500);
    });
    file.data.pipe(res);
  } catch (err) {
    console.error('Erro ao buscar arquivo:', err);
    res.sendStatus(404);
  }
}

async function uploadOrUpdateFile(campo: string, cpf: string, file: Express.Multer.File, cpfFolderId: string, driveId: string) {
  const fileName = `${campo}_${cpf}`;
  const existingFile = await drive.files.list({
    corpora: "drive",
    driveId: driveId,
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
    driveId: driveId,
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