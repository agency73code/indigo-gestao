import { z } from "zod";
import { uuidParam } from "../../../schemas/utils/uuid.js";
import { dateStringToDate } from "../../../schemas/utils/dateStringToDate.js";

const statusEnum = z.enum(['pendente', 'aprovado', 'rejeitado']);
const orderByEnum = z.enum(['recent', 'oldest']);

export const listBillingSchema = z.object({
    q: z.string().trim().optional(),
    terapeutaId: uuidParam.optional(),
    clienteId: uuidParam.optional(),
    status: statusEnum.optional(),
    dataInicio: dateStringToDate.optional(),
    dataFim: dateStringToDate.optional(),
    orderBy: orderByEnum.default('recent'),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
});
