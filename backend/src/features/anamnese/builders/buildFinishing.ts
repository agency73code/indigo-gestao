import type { Prisma } from '@prisma/client';
import type { AnamnesePayload } from '../../../schemas/anamnese.schema.js';

type FinishingPayload = AnamnesePayload['finalizacao'];

type FinishingCreateInput = Pick<Prisma.anamneseCreateInput, 'finalizacao'>;

export function buildFinishing(finishing: FinishingPayload): FinishingCreateInput {
    return {
        finalizacao: {
            create: {
                outras_informacoes_relevantes: finishing.outrasInformacoesRelevantes ?? null,
                observacoes_impressoes_terapeuta: finishing.observacoesImpressoesTerapeuta ?? null,
                expectativas_familia: finishing.expectativasFamilia ?? null,
            },
        },
    };
}
