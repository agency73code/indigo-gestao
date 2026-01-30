import { faturamento_tipo_atendimento } from '@prisma/client';
import { z } from 'zod';

export const billingSchema = z.object({
    dataSessao: z.string().min(1),
    horarioInicio: z.string().min(1),
    horarioFim: z.string().min(1),
    tipoAtendimento: z.enum(faturamento_tipo_atendimento),
    ajudaCusto: z.boolean().nullable().default(null),
    observacaoFaturamento: z.string().nullable().default(null),
})
.superRefine((data, ctx) => {
    if (data.horarioFim <= data.horarioInicio) {
        ctx.addIssue({
            code: 'custom',
            path: ['horarioFim'],
            message: 'Horário de término deve ser maior que o horário de início',
        });
    }

    if (data.tipoAtendimento === 'homecare' && data.ajudaCusto === null) {
        ctx.addIssue({
            code: 'custom',
            path: ['ajudaCusto'],
            message: 'Ajuda de custo é obrigatória para atendimento homecare',
        });
    }
});

export type billingPayload = z.infer<typeof billingSchema>;