import { z } from 'zod';
import { uuidParam } from '../../schemas/utils/uuid.js';
import { dateStringToDate, nullableDateStringToDate } from '../../schemas/utils/dateStringToDate.js';
import { idParam } from '../../schemas/utils/id.js';


export const linksSchema = z.object({
    patientId: uuidParam,
    therapistId: uuidParam,
    role: z.enum(["responsible", "co"]),
    startDate: dateStringToDate,
    notes: z.string().nullable().default(null),
    actuationArea: z.string({ message: 'Informe a area de atuação' }),
    valorSessao: z.number({ message: 'Informe o valor da sessão' }).positive({ message: 'Informe um valor da sessão positivo' }),
});

export const transferResponsibleSchema = z.object({
    patientId: uuidParam,
    fromTherapistId: uuidParam,
    toTherapistId: uuidParam,
    effectiveDate: dateStringToDate,
    oldResponsibleActuation: z.string(),
    newResponsibleActuation: z.string(),
});

export const linksUpdateSchema = z.object({
    id: idParam,
    role: z.enum(['responsible', 'co']),
    startDate: dateStringToDate,
    endDate: nullableDateStringToDate,
    notes: z.string().nullable().default(null),
    actuationArea: z.string({ message: 'Informe a area de atuação' }),
    valorSessao: z.number({ message: 'Informe o valor da sessão' }).positive({ message: 'Informe um valor da sessão positivo' }),
})


export type linksPayload = z.infer<typeof linksSchema>;
export type transferResponsiblePayload = z.infer<typeof transferResponsibleSchema>;
export type linksUpdatePayload = z.infer<typeof linksUpdateSchema>;