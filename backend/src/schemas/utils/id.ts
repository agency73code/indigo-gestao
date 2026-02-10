import { z } from 'zod';

export const idParam = z
    .coerce
    .number({ message: 'Id deve ser um número.' })
    .int({ message: 'Id deve ser um inteiro.' })
    .positive({ message: 'Id deve ser positivo.' });

export const optionalIdParam = z.preprocess(
  (value) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return value;
  },
  idParam.optional()
);

export const idsParam = z.object({
  ids: z
    .array(
        z.coerce
        .number({ message: 'Id deve ser um número.' })
        .int({ message: 'Id deve ser um inteiro.' })
        .positive({ message: 'Id deve ser positivo.' })
    )
});