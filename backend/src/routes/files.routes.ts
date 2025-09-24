import { Router } from "express";
import * as FileController from "../controllers/files.controller.js";
import { upload } from "../config/multer.js"


const router: Router = Router();

router.get("/view/:id", FileController.viewImg);

router.post("/upload", upload.fields([
    { name: "fotoPerfil", maxCount: 1 },
    { name: "diplomaGraduacao", maxCount: 1 },
    { name: "diplomaPosGraduacao", maxCount: 1 },
    { name: "registroCRP", maxCount: 1 },
    { name: "comprovanteEndereco", maxCount: 1 },
]), FileController.uploadFile);

export default router;
