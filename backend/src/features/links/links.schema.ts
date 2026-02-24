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
    valorClienteSessao: z.number({ message: 'Informe o valor da sessão do cliente' }).positive({ message: 'Informe um valor da sessão do cliente positivo' }),
    valorSessaoConsultorio: z.number({ message: 'Informe o valor da sessão em consultório' }).positive({ message: 'Informe um valor positivo' }),
    valorSessaoHomecare: z.number({ message: 'Informe o valor da sessão homecare' }).positive({ message: 'Informe um valor positivo' }),
    valorHoraDesenvolvimentoMateriais: z.number({ message: 'Informe o valor/hora de desenvolvimento de materiais' }).positive({ message: 'Informe um valor positivo' }),
    valorHoraSupervisaoRecebida: z.number({ message: 'Informe o valor/hora de supervisão recebida' }).positive({ message: 'Informe um valor positivo' }),
    valorHoraSupervisaoDada: z.number({ message: 'Informe o valor/hora de supervisão dada' }).positive({ message: 'Informe um valor positivo' }),
    valorHoraReuniao: z.number({ message: 'Informe o valor/hora de reunião' }).positive({ message: 'Informe um valor positivo' }),
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
    valorClienteSessao: z.number({ message: 'Informe o valor da sessão do cliente' }).positive({ message: 'Informe um valor da sessão do cliente positivo' }),
    valorSessaoConsultorio: z.number({ message: 'Informe o valor da sessão em consultório' }).positive({ message: 'Informe um valor positivo' }),
    valorSessaoHomecare: z.number({ message: 'Informe o valor da sessão homecare' }).positive({ message: 'Informe um valor positivo' }),
    valorHoraDesenvolvimentoMateriais: z.number({ message: 'Informe o valor/hora de desenvolvimento de materiais' }).positive({ message: 'Informe um valor positivo' }),
    valorHoraSupervisaoRecebida: z.number({ message: 'Informe o valor/hora de supervisão recebida' }).positive({ message: 'Informe um valor positivo' }),
    valorHoraSupervisaoDada: z.number({ message: 'Informe o valor/hora de supervisão dada' }).positive({ message: 'Informe um valor positivo' }),
    valorHoraReuniao: z.number({ message: 'Informe o valor/hora de reunião' }).positive({ message: 'Informe um valor positivo' }),
})


export type linksPayload = z.infer<typeof linksSchema>;
export type transferResponsiblePayload = z.infer<typeof transferResponsibleSchema>;
export type linksUpdatePayload = z.infer<typeof linksUpdateSchema>;