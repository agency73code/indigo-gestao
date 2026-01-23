import { z } from 'zod';

export const arquivoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});