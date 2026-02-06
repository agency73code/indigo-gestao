import type { CorrectBillingData, ExistingBillingFileUpdate } from "../schemas/correctBillingSchema.js";
import type { CreateBillingPayload } from "./CreateBillingPayload.js";

export type CorrectBillingReleaseInput = {
    launchId: number;
    userId: string;
    billing: CorrectBillingData['faturamento'];
    billingFiles: CreateBillingPayload['billingFiles'];
    existingFiles: ExistingBillingFileUpdate[];
    tipoAtividade: CorrectBillingData['tipoAtividade'];
    comentario: CorrectBillingData['comentario'];
};