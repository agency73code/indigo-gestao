import z from "zod";

export const dateRangeSchema = z.enum([
  'custom',
  '30d',
  '90d',
  'all',
  'year',
  'last30',
  'last7',
]);

export type DateRange = z.infer<typeof dateRangeSchema>;