import { z } from 'zod';

export const dateStringToDate = z.union([
    z.coerce.date(),
    z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Formato inválido (YYYY-MM-DD)' })
        .transform((s) => {
            const [yStr, mStr, dStr] = s.split('-') as [string, string, string];
            const y = Number(yStr);
            const m = Number(mStr);
            const d = Number(dStr);

            return new Date(Date.UTC(y, m - 1, d));
        })
        .refine((dt) => !Number.isNaN(dt.getTime()), { message: 'Data inválida' }),
]).pipe(
    z.date({ message: 'Data de nascimento inválida' })
);