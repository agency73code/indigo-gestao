import { z } from 'zod';
import { uuidParam } from '../../schemas/utils/uuid.js';
import { dateStringToDate } from '../../schemas/utils/dateStringToDate.js';


export const linksSchema = z.object({
    patientId: uuidParam,
    therapistId: uuidParam,
    role: z.enum(["responsible", "co"]),
    startDate: dateStringToDate,
    notes: z.string().nullable().default(null),
    actuationArea: z.string({ message: 'Informe a area de atuação' }),
    valorSessao: z.number({ message: 'Informe o valor da sessão' }).positive({ message: 'Informe um valor da sessão positivo' }),
});

export type linksPayload = z.infer<typeof linksSchema>;