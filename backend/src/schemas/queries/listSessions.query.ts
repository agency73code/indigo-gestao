import { z } from 'zod';
import { dateRangeSchema } from './dateRange.schema.js';

export const listClientProgramsSchema = z.object({
    q: z.string().min(1).optional(),
    status: z.enum(['all', 'active', 'archived']).default('all'),
    sort: z.enum(['recent', 'alphabetic']).default('recent'),
    page: z.coerce.number().int().positive().default(1),
    area: z.string().min(1),
})

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (val) => !Number.isNaN(Date.parse(val)),
    { message: 'Invalid date' }
  );

export const listSessionsByClientSchema = z.object({
    area: z.string().min(1),
    periodMode: dateRangeSchema.default('all'),
    sort: z.enum(['date-asc', 'date-desc', 'accuracy-desc', 'accuracy-asc']).default('date-asc'),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().default(10),
    q: z.string().min(1).optional(),
    programId: z.coerce.number().int().positive().optional(),
    therapistId: z.string().min(1).optional(),
    stimulusId: z.coerce.number().int().positive().optional(),
    periodStart: isoDateString.optional(),
    periodEnd: isoDateString.optional(),
})