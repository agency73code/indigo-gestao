import type { Request } from "express";
import { billingSchema } from "./billing.schema.js";
import type { BillingInput } from "./types/BillingInput.js";

export function buildBillingInputFromRequest(req: Request): BillingInput {
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

    const billing = billingSchema.parse(data.faturamento);

    return { billing, billingFiles };
}