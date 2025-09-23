import type { Request, Response } from "express";
import { drive } from "../config/googleDrive.js";
import { Readable } from "stream";

export async function uploadFile(req: Request, res: Response) {
  const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  try {
    const { cpf } = req.body as { cpf?: string };
    if (!cpf) return res.status(400).json({ error: "CPF é obrigatório para upload" });

    const normalizedCpf = cpf.replace(/[^\d]/g, '');

    const files = req.files as Record<string, Express.Multer.File[]>;
    const uploads: { tipo_documento: string; view_url: string; download_url: string; data_upload: string }[] = [];

    const existing = await drive.files.list({
      corpora: 'drive',
      driveId: FOLDER_ID,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      q: `name = '${cpf}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name, parents)',
    });

    let cpfFolderId: string;
    if (existing.data.files && existing.data.files.length > 0) {
      console.log(`Pasta existente encontrada para CPF ${normalizedCpf}: ${existing.data.files[0]!.id}`);
      cpfFolderId = existing.data.files[0]!.id!;
    } else {
      console.log(`Criando nova pasta para CPF ${normalizedCpf}`);
      const folderResponse = await drive.files.create({
        requestBody: {
          name: normalizedCpf,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [FOLDER_ID],
        },
        fields: 'id',
        supportsAllDrives: true,
      });
      cpfFolderId = folderResponse.data.id!;
    }


    for (const [campo, lista] of Object.entries(files)) {
      if (!lista?.length) continue;
      
      for (const file of lista) {
        const fileName = campo + '_' + normalizedCpf;
        const existingFile = await drive.files.list({
          corpora: 'drive',
          driveId: FOLDER_ID,
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
          q: `name = '${fileName}' and '${cpfFolderId}' in parents and trashed = false`,
          fields: 'files(id, name, createdTime)'
        });

        let fileId: string;

        if (existingFile.data.files && existingFile.data.files.length > 0) {
          fileId = existingFile.data.files[0]!.id!;
          console.log(`Atualizando arquivo existente: ${fileName}`);

          await drive.files.update({
            fileId: fileId,
            media: {
              mimeType: file.mimetype,
              body: Readable.from(file.buffer),
            },
            supportsAllDrives: true,
          });
        } else {
          console.log(`Criando novo arquivo: ${fileName}`);
          const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [cpfFolderId],
            },
            media: {
                mimeType: file.mimetype,
                body: Readable.from(file.buffer),
            },
            fields: "id, webViewLink",
            supportsAllDrives: true,
          });

          fileId = response.data.id!;
        };
        uploads.push({
            tipo_documento: campo,
            view_url: `https://drive.google.com/uc?export=view&id=${fileId}`,
            download_url: `https://drive.google.com/uc?export=download&id=${fileId}`,
            data_upload: new Date().toISOString(),
        });
      }
    }

    res.json({ documentos: uploads });
  } catch (err) {
    console.error("Erro upload:", err);
    res.status(500).json({ error: "Falha no upload" });
  }
}