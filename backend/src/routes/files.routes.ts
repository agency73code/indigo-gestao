import { Router } from "express";
import * as FileController from "../controllers/files.controller.js";
import { upload } from "../config/multer.js"


const router: Router = Router();

router.get("/", FileController.listFiles);
router.get("/:storageId/view", FileController.viewFile);
router.get("/:storageId/download", FileController.downloadFile);
router.post("/", upload.single("file"), FileController.uploadFile);
router.delete("/:id", FileController.deleteFile);

// Rotas legadas mantidas para compatibilidade com versões anteriores do frontend
router.get("/view/:id", FileController.viewFile);
router.post(
    "/upload",
    upload.fields([
        { name: "fotoPerfil", maxCount: 1 },
        { name: "diplomaGraduacao", maxCount: 1 },
        { name: "diplomaPosGraduacao", maxCount: 1 },
        { name: "registroCRP", maxCount: 1 },
        { name: "comprovanteEndereco", maxCount: 1 },
        { name: "carterinhaPlano", maxCount: 1 },
        { name: "comprovanteCpf", maxCount: 1 },
        { name: "comprovanteResidencia", maxCount: 1 },
        { name: "documentoIdentidade", maxCount: 1 },
        { name: "prescricaoMedica", maxCount: 1 },
        { name: "relatoriosMedicos", maxCount: 1 },
    ]),
    FileController.create,
);

export default router;
