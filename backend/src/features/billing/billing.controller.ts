import type { Request } from "express";
import { billingSchema } from "./billing.schema.js";
import type { BillingInput } from "./types/BillingInput.js";

export function buildBillingInputFromRequest(req: Request): BillingInput {
    const data = JSON.parse(req.body.data);

    const allFiles = (req.files as Express.Multer.File[]) || [];

    const billingMeta = req.body.billingFilesMeta
        ? JSON.parse(req.body.billingFilesMeta)
        : [];
    
    const billingFilesRaw = allFiles
        .filter((file) => file.fieldname === 'billingFiles')

    const billingFiles = billingFilesRaw.map((file, i) => ({
        ...file,
        size:
            typeof billingMeta?.[i]?.size === 'number'
                ? billingMeta[i].size
                : file.size,
    }))

    const billing = billingSchema.parse(data.faturamento);

    return { billing, billingFiles };
}