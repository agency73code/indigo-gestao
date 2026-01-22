import type { NextFunction, Request, Response } from "express";
import { psychoQuerySchema, psychoSchema } from "./psychotherapy.schema.js";
import * as psychothrapyService from "./psychotherapy.service.js";
import { ZodError } from "zod";
import { uuidParam } from "../../../schemas/utils/uuid.js";

export async function createPsychotherapyRecord(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

        const payload = psychoSchema.parse(req.body);
        const data = await psychothrapyService.createPsychotherapyRecord(payload, userId);

        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0]?.message
            });
        }

        next(error);
    }
}

export async function searchMedicalRecordByClient(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

        const clientId = uuidParam.parse(req.params.clientId);
        const data = await psychothrapyService.searchMedicalRecordByClient(clientId);

        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0]?.message
            });
        }

        next(error);
    }
}

export async function listMedicalRecords(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

        const query = psychoQuerySchema.parse(req.query);
        
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0]?.message
            });
        }

        next(error);
    }
}