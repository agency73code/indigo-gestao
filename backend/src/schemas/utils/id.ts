import { z } from 'zod';

export const idParam = z
    .coerce
    .number({ message: 'Id deve ser um número.' })
    .int({ message: 'Id deve ser um inteiro.' })
    .positive({ message: 'Id deve ser positivo.' });