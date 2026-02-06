import type { billingSchema } from "../billing.schema.js"

export type BillingInput = {
    billing: ReturnType<typeof billingSchema.parse>;
    billingFiles: Array<Express.Multer.File & { size: number }>;
}