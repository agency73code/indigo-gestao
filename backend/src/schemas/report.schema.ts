import z from 'zod';
import type { StructuredReportData, ReportStatus, ReportType } from '../features/reports/report.types.js';

const structuredDataSchema: z.ZodType<StructuredReportData> = z.object({
    filters: z.record(z.string(), z.any()).default({}),
    generatedData: z.record(z.string(), z.any()).default({}),
});

const dateStringSchema = z.string().refine((value) => {
    return !Number.isNaN(Date.parse(value));
}, 'Data inválida');

export const reportPayloadSchema = z.object({
    title: z.string().min(3),
    type: z.enum(['mensal', 'trimestral', 'semestral', 'anual', 'custom']),
    patientId: z.string().min(1),
    therapistId: z.string().min(1),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    clinicalObservations: z.string().optional(),
    status: z.enum(['draft', 'final', 'archived']).default('final'),
    data: z.preprocess((value) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    }, structuredDataSchema).default({ filters: {}, generatedData: {} }),
}).refine((value) => value.periodStart <= value.periodEnd, {
    message: 'periodStart deve ser anterior ou igual a periodEnd',
    path: ['periodStart'],
});

export type reportPayloadSchema = z.infer<typeof reportPayloadSchema> & { status: ReportStatus; type: ReportType };

export const reportListQuerySchema = z.object({
    patientId: z.string().optional(),
    therapistId: z.string().optional(),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    status: z.union([z.enum(['draft', 'final', 'archived']), z.literal('all')]).optional(),
    type: z.union([z.enum(['mensal', 'trimestral', 'semestral', 'anual', 'custom']), z.literal('all')]).optional(),
});

export type reportListQuerySchema = z.infer<typeof reportListQuerySchema>;

