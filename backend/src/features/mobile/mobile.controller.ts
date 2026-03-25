import type { NextFunction, Request, Response } from "express";
import { unauthenticated } from "../../errors/unauthenticated.js";
import * as MobileService from './mobile.service.js';
import { bootstrapSessionsQuerySchema } from "./mobile.schema.js";

export async function getBootstrapBase(req: Request, res: Response, next: NextFunction) {
    try {
        const therapistId = req.user?.id;
        if (!therapistId) throw unauthenticated();

        const data = await MobileService.getBootstrapBase(therapistId);
        return res.status(200).json(data);
    } catch (err) {
        return next(err);
    }
}

export async function getBootstrapPrograms(req: Request, res: Response, next: NextFunction) {
    try {
        const therapistId = req.user?.id;
        if (!therapistId) throw unauthenticated();

        const data = await MobileService.getBootstrapPrograms(therapistId);
        return res.status(200).json(data);
    } catch (err) {
        return next(err);
    }
}

export async function getBootstrapStimuli(req: Request, res: Response, next: NextFunction) {
    try {
        const therapistId = req.user?.id;
        if (!therapistId) throw unauthenticated();

        const data = await MobileService.getBootstrapStimuli(therapistId);
        return res.status(200).json(data);
    } catch (err) {
        return next(err);
    }
}

export async function getBootstrapSessions(req: Request, res: Response, next: NextFunction) {
    try {
        const therapistId = req.user?.id;
        if (!therapistId) throw unauthenticated();

        const { days } = bootstrapSessionsQuerySchema.parse(req.query);
        const data = await MobileService.getBootstrapSessions(therapistId, days);
        return res.status(200).json({
            days,
            ...data,
        });
    } catch (err) {
        return next(err);
    }
}