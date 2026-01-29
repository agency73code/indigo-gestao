import { z } from 'zod';
import { FINALIDADE_REUNIAO } from './ata.types.js';
import { ata_finalidade_reuniao, ata_modalidade_reuniao, ata_participante_tipo, ata_status } from '@prisma/client';
import { uuidParam } from '../../schemas/utils/uuid.js';
import { dateStringToDate } from '../../schemas/utils/dateStringToDate.js';

export const ataStatusSchema = z.enum(ata_status)
export const ataModalidadeSchema = z.enum(ata_modalidade_reuniao);
export const ataFinalidadeSchema = z.enum(ata_finalidade_reuniao);
export const ataParticipanteTipoSchema = z.enum(ata_participante_tipo);

const finalidadeValues = Object.values(FINALIDADE_REUNIAO) as [string, ...string[]];
// const modalidadeValues = Object.values(MODALIDADE_REUNIAO) as [string, ...string[]];

const queryBoolean = z.preprocess((v) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1') return true;
    if (s === 'false' || s === '0') return false;
  }
  return v;
}, z.boolean());

const optionalNumberFromString = z.preprocess(
    (value) => {
        if (value === '' || value === null || value === undefined) return undefined;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? value : parsed;
    },
    z.number().int().optional(),
);

const optionalTrimmedString = z.preprocess(
    (value) => {
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().optional(),
);

export const gerarResumoSchema = z.object({
    conteudo: z
        .string()
        .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
        .max(50000, 'Conteúdo muito longo'),
    finalidade: z.enum(finalidadeValues),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    participantes: z.array(z.string()).optional(),
    terapeuta: z.string().min(2, 'Nome do terapeuta é obrigatório'),
    profissao: z.string().min(2, 'Profissão é obrigatória'),
    cliente: z.string().optional(),
    // Campos extras para WhatsApp
    horarioInicio: z.string().optional(),
    horarioFim: z.string().optional(),
    duracao: z.string().optional(),
    conselho: z.string().optional(),
    // Links de recomendação
    links: z.array(z.object({
        titulo: z.string(),
        url: z.string(),
    })).optional(),
});

export const listTherapistSchema = z.object({
    atividade: queryBoolean.default(true),
});

export const ataIdSchema = z.object({
    id: z.coerce
        .number('ID inválido')
        .int('ID deve ser um número inteiro')
        .positive('ID deve ser maior que zero')
});

export const listAtaSchema = z.object({
    q: optionalTrimmedString,
    finalidade: ataFinalidadeSchema.optional(),
    data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data início inválida (YYYY-MM-DD)').optional(),
    data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data fim inválida (YYYY-MM-DD)').optional(),
    terapeuta_id: z.uuid({ message: 'UUID inválido' }).optional(),
    cliente_id: z.uuid({ message: 'UUID inválido' }).optional(),
    order_by: z.enum(['recent', 'oldest']).default('recent'),
    page: optionalNumberFromString.default(1),
    page_size: optionalNumberFromString.default(10),
});

export const ataParticipanteSchema = z
    .object({
        id: z.number().int().positive().optional(),
        tipo: ataParticipanteTipoSchema,
        nome: z.string().min(1),
        descricao: z.string().nullable().default(null),
        terapeuta_id: z.uuid({ message: 'UUID inválido' }).nullable().default(null),
        removed: z.literal(true).optional(),
    }).superRefine((p, ctx) => {
        if (p.tipo === ata_participante_tipo.profissional_clinica && !p.terapeuta_id) {
            ctx.addIssue({
                code: 'custom',
                message: 'terapeuta_id é obrigatório para participante profissional_clinica',
                path: ['terapeuta_id'],
            });
        }
    });

export const ataLinkSchema = z.object({
    titulo: z.string().min(1),
    url: z.string().min(1),
});

export const ataBaseSchema = z
    .object({
        terapeuta_id: uuidParam,
        cliente_id: uuidParam.nullable().default(null),
        data: dateStringToDate,
        horario_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido (HH:mm)'),
        horario_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido (HH:mm)'),
        finalidade: ataFinalidadeSchema,
        finalidade_outros: z.string().nullable().default(null),
        modalidade: ataModalidadeSchema,
        conteudo: z.string().min(1),
        status: ataStatusSchema.default(ata_status.rascunho),
        participantes: z.array(ataParticipanteSchema).min(1),
        links: z.array(ataLinkSchema).nullable().default([]),
    })
    .superRefine((val, ctx) => {
        if (val.finalidade === ata_finalidade_reuniao.outros) {
            if (!val.finalidade_outros || val.finalidade_outros.trim().length === 0) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Descreva a finalidade da reunião',
                    path: ['finalidade_outros'],
                });
            }
        }
    });

export const createAtaPayloadSchema = ataBaseSchema;
export const updateAtaPayloadSchema = ataBaseSchema.omit({ terapeuta_id: true });

export type GerarResumoInput = z.infer<typeof gerarResumoSchema>;
export type createAtaPayload = z.infer<typeof createAtaPayloadSchema>;
export type updateAtaPayload = z.infer<typeof updateAtaPayloadSchema>;