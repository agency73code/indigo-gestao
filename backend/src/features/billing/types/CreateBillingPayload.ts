import type { billingPayload } from "../billing.schema.js";

type BillingFile = Express.Multer.File & { size: number };

export interface CreateBillingPayload {
    billing: billingPayload;
    billingFiles: BillingFile[];
}