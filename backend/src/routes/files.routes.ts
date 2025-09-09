import { Router } from "express";
import multer from "multer";
import { drive } from "../config/googleDrive.js";
import { Readable } from "stream";

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.fields([
    { name: "fotoPerfil" },
    { name: "diplomaGraduacao" },
    { name: "diplomaPosGraduacao" },
    { name: "registroCRP" },
    { name: "comprovanteEndereco" },
  ]),
  async (req, res) => {
    try {
        const files = req.files as Record<string, Express.Multer.File[]>;
        const uploads: { tipo_documento: string; caminho_arquivo: string }[] = [];


      for (const [campo, lista] of Object.entries(files)) {
        if (!lista?.length) continue;
        const file = lista[0];
        if (!file) return;
        const response = await drive.files.create({
          requestBody: {
            name: file.originalname,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
          },
          media: {
            mimeType: file.mimetype,
            body: Readable.from(file.buffer),
          },
          fields: "id, webViewLink",
        });
        console.log(response.data);
        uploads.push({
          tipo_documento: campo,
          caminho_arquivo: response.data.webViewLink ?? response.data.id!,
        });
      }

      res.json({ documentos: uploads });
    } catch (err) {
      console.error("Erro upload:", err);
      res.status(500).json({ error: "Falha no upload" });
    }
  }
);

export default router;
