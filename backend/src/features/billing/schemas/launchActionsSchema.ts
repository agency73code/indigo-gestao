import { z } from 'zod';

export const actionLaunchSchema = z
    .object({
        motivo: z.string().nullable().optional(),
        valorAjudaCusto: z.coerce.number().positive().optional(),
    })
    .superRefine((data, ctx) => {
        const hasMotivo = data.motivo !== undefined;
        const hasValor = data.valorAjudaCusto !== undefined;

        if (hasMotivo === hasValor) {
            ctx.addIssue({
            code: 'custom',
            message: 'Envie exatamente um: "motivo" (rejeitar) OU "valorAjudaCusto" (aprovar).',
            path: ['motivo'],
            });
        }
    });

export type actionLaunchPayload = z.infer<typeof actionLaunchSchema>;