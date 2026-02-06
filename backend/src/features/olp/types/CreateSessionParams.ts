import type { Prisma } from "@prisma/client";
import type { CreateBillingPayload } from "../../billing/types/CreateBillingPayload.js";
import type { CreateAreaSessionData } from "./olp.schema.js"

export type UploadedFile = Express.Multer.File & { size: number };

export type CreateSessionParams = {
    input: CreateAreaSessionData & { files: UploadedFile[] };
    billingInput: CreateBillingPayload;
}

export type Tx = Prisma.TransactionClient;