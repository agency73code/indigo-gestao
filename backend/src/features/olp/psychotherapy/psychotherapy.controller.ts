import type { NextFunction, Request, Response } from "express";
import { psychoQuerySchema, psychoSchema } from "./psychotherapy.schema.js";
import * as psychothrapyService from "./psychotherapy.service.js";
import { ZodError } from "zod";
import { uuidParam } from "../../../schemas/utils/uuid.js";
import { unauthenticated } from "../../../errors/unauthenticated.js";
import { idParam } from "../../../schemas/utils/id.js";

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
        if (!userId) throw unauthenticated();

        const clientId = uuidParam.parse(req.params.clientId);
        const data = await psychothrapyService.searchMedicalRecordByClient(clientId, userId);

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
        if (!userId) throw unauthenticated();

        const query = psychoQuerySchema.parse(req.query);
        const data = await psychothrapyService.listMedicalRecords(query, userId);

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
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: error.issues[0]?.message
            });
        }

        next(error);
    }
}

export async function createEvolution(req: Request, res: Response, next: NextFunction) {
    try {
        console.log(req.params);
        console.log(req.body);
        console.log(req.files);

        res.status(201).json({
            success: true,
            data: [],
        })
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