import { R2UploadService } from "../../file/r2/r2-upload.js";
import type { UploadedFile } from "../types/CreateSessionParams.js";

export async function uploadSessionFiles(files: UploadedFile[], programId: number, patientId: string) {
  const uploadedFiles = [];

  for (const file of files) {
    const uploaded = await R2UploadService.uploadFile({
      buffer: file.buffer,
      contentType: file.mimetype,
      filename: file.originalname,
      programId,
      patientId,
    });

    uploadedFiles.push({
      nome: file.originalname,
      caminho: uploaded.key,
      tamanho: file.size,
    });
  }

  return uploadedFiles;
}