import { z } from "zod";
import { uuidParam } from "../../../schemas/utils/uuid.js";
import { dateStringToDate } from "../../../schemas/utils/dateStringToDate.js";
import { faturamento_status } from "@prisma/client";

const statusEnum = z.enum(faturamento_status);
const orderByEnum = z.enum(['recent', 'oldest']);
const orderBySchema = orderByEnum
    .default('oldest')
    .transform((value) => {
        return value === 'oldest'
            ? { criado_em: 'asc' as const }
            : { criado_em: 'desc' as const };
    })

export const listBillingSchema = z.object({
    q: z.string().trim().optional(),
    terapeutaId: uuidParam.optional(),
    clienteId: uuidParam.optional(),
    status: statusEnum.optional(),
    dataInicio: dateStringToDate.optional(),
    dataFim: dateStringToDate.optional(),
    orderBy: orderBySchema,
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
});

export type listBillingPayload = z.infer<typeof listBillingSchema>;
