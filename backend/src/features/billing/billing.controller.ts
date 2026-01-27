import type { NextFunction, Request, Response } from "express";
import { billingSchema } from "./billing.schema.js";
import * as billingService from "./billing.service.js";
import type { BillingTarget } from "./types/BillingTarget.js";

export async function createBilling(
    req: Request,
    res: Response,
    next: NextFunction,
    target: BillingTarget
) {
    try {
        const data = JSON.parse(req.body.data);
        const billingMeta = req.body.billingFilesMeta
            ? JSON.parse(req.body.billingFilesMeta)
            : [];
        
        const billingFiles = ((req.files as Express.Multer.File[]) || [])
        .filter((file) => file.fieldname === 'billingFiles')
        .map((file, i) => ({
            ...file,
            size: billingMeta[i]?.size ?? file.size,
        }));

        const payload = {
            billing: billingSchema.parse(data.faturamento),
            billingFiles,
        };
        
        await billingService.createBilling(payload, target);

        return;
    } catch (error) {
        next(error);
    }
}