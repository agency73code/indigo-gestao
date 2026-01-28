import type { ParsedFile } from "../../../../types/ParsedFile.js";
import type { BillingInput } from "../../../billing/types/BillingInput.js";
import type { CreateEvolutionType } from "../psychotherapy.schema.js";

export type CreateEvolutionServiceInput = {
  payload: CreateEvolutionType;
  attachments: ParsedFile[];
  billingPayload: BillingInput;
  medicalRecordId: number;
  userId: string;
};