import type { NextFunction, Request, Response } from "express";
import { createEvolutionPayloadSchema, psychoQuerySchema, psychoSchema, psychoUpdateSchema } from "./psychotherapy.schema.js";
import * as psychothrapyService from "./psychotherapy.service.js";
import { uuidParam } from "../../../schemas/utils/uuid.js";
import { unauthenticated } from "../../../errors/unauthenticated.js";
import { idParam } from "../../../schemas/utils/id.js";
import { buildBillingInputFromRequest } from "../../billing/billing.controller.js";

export async function createPsychotherapyRecord(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();

        const payload = psychoSchema.parse(req.body);
        const data = await psychothrapyService.createPsychotherapyRecord(payload, userId);

        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function searchMedicalRecordByClient(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();

        const clientId = uuidParam.parse(req.params.clientId);
        const data = await psychothrapyService.searchMedicalRecordByClient(clientId, userId);

        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function listMedicalRecords(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();

        const query = psychoQuerySchema.parse(req.query);
        const data = await psychothrapyService.listMedicalRecords(query, userId);

        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function searchMedicalRecordById(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();

        const medicalRecordId = idParam.parse(req.params.medicalRecordId);
        const data = await psychothrapyService.searchMedicalRecordById(medicalRecordId, userId);

        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function createEvolution(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();

        const medicalRecordId = idParam.parse(req.params.medicalRecordId);

        const payload = createEvolutionPayloadSchema.parse(
            JSON.parse(req.body.payload)
        );
        
        const allFiles = (req.files as Express.Multer.File[]) || [];

        const uploadedFiles = allFiles
            .filter((f) => f.fieldname === 'files')
            .map((file) => ({
                ...file,
                size: file.size,
            }));

        const attachments = uploadedFiles.map((f) => ({
            buffer: f.buffer,
            mime_type: f.mimetype,
            original_name: f.originalname,
            name: f.originalname,
            size: f.size,
        }));

        const billingPayload = buildBillingInputFromRequest(req);

        await psychothrapyService.createEvolution({
            payload,
            attachments,
            billingPayload,
            medicalRecordId,
            userId
        });

        res.status(201).json({
            success: true,
            "message": "Evolução registrada com sucesso"
        });
    } catch (error) {
        next(error);
    }
}

export async function listEvolutions(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();
    
        const medicalRecordId = idParam.parse(req.params.medicalRecordId);
        const data = await psychothrapyService.listEvolutions(medicalRecordId, userId);

        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateMedicalRecord(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();

        const medicalRecordId = idParam.parse(req.params.medicalRecordId);
        const payload = psychoUpdateSchema.parse(req.body);
        
        const data = await psychothrapyService.updateMedicalRecord(payload, medicalRecordId, userId);

        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}