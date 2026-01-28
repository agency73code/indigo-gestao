import type { Prisma } from "@prisma/client";
import type { BillingTarget } from "./types/BillingTarget.js";
import type { CreateBillingPayload } from "./types/CreateBillingPayload.js";
import { buildUtcDate } from "./utils/buildUtcDate.js";
import { uploadBillingFiles } from "./utils/uploadBillingFiles.js";

export async function createBilling(tx: Prisma.TransactionClient, payload: CreateBillingPayload, target: BillingTarget) {
    const { billing, billingFiles } = payload;
    const { sessionId, evolutionId } = target;
    const inicio_em = buildUtcDate(billing.dataSessao, billing.horarioInicio);
    const fim_em = buildUtcDate(billing.dataSessao, billing.horarioFim);

    const createdBilling = await tx.faturamento.create({
        data: {
            inicio_em,
            fim_em,
            tipo_atendimento: billing.tipoAtendimento,
            ajuda_custo: billing.ajudaCusto,
            observacao_faturamento: billing.observacaoFaturamento,
            sessao_id: sessionId ?? null,
            evolucao_id: evolutionId ?? null,
        }
    });

    if (billingFiles.length > 0) {
        const uploaded = await uploadBillingFiles({
            billingId: createdBilling.id,
            files: billingFiles,
        });

        await tx.faturamento_arquivo.createMany({
            data: uploaded.map((f) => ({
                faturamento_id: createdBilling.id,
                nome: f.originalName,
                caminho: f.key,
                mime_type: f.mimeType,
                tamanho: f.size,
            })),
        });
    }

    return createdBilling;
}