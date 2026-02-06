import { z } from 'zod';

export const idParam = z
    .coerce
    .number({ message: 'Id deve ser um número.' })
    .int({ message: 'Id deve ser um inteiro.' })
    .positive({ message: 'Id deve ser positivo.' });

export const idsParam = z.object({
  ids: z
    .array(
        z.coerce
        .number({ message: 'Id deve ser um número.' })
        .int({ message: 'Id deve ser um inteiro.' })
        .positive({ message: 'Id deve ser positivo.' })
    )
});