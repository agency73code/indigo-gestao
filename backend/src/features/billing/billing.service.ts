import type { Prisma } from "@prisma/client";
import type { BillingTarget } from "./types/BillingTarget.js";
import type { CreateBillingPayload } from "./types/CreateBillingPayload.js";
import { buildUtcDate } from "./utils/buildUtcDate.js";
import { R2GenericUploadService } from "../file/r2/r2-upload-generic.js";
import { AppError } from "../../errors/AppError.js";

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

    if (billingFiles.length === 0) return createdBilling;

    const uploaded = await R2GenericUploadService.uploadMany({
        prefix: `faturamentos/${createdBilling.id}`,
        files: billingFiles.map((f) => ({
            buffer: f.buffer,
            mimetype: f.mimetype,
            originalname: f.originalname,
            size: f.size,
        })),
    });

    if (uploaded.length !== billingFiles.length) {
        await R2GenericUploadService.deleteMany(uploaded.map((u) => u.key));
        throw new AppError('UPLOAD_FAILED', 'Falha ao fazer upload dos arquivos do faturamento', 500);
    }

    try {
        await tx.faturamento_arquivo.createMany({
            data: billingFiles.map((f, i) => ({
                faturamento_id: createdBilling.id,
                nome: f.originalname,
                caminho: uploaded[i]!.key,
                mime_type: uploaded[i]!.tipo,
                tamanho: uploaded[i]!.tamanho,
            })),
        });
    } catch (err) {
        await Promise.allSettled([
            R2GenericUploadService.deleteMany(uploaded.map((u) => u.key)),
        ]);
        throw err;
    }

    return createdBilling;
}