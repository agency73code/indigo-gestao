import type { NextFunction, Request, Response } from "express";
import { psychoSchema } from "./psychotherapy.schema.js";
import * as psychothrapyService from "./psychotherapy.service.js";

export async function createPsychotherapyRecord(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

        const payload = psychoSchema.parse(req.body);
        const data = await psychothrapyService.createPsychotherapyRecord(payload, userId);

        console.log(data);
        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error)
    }
}