import { faturamento_status, type Prisma } from "@prisma/client";
import type { BillingTarget } from "./types/BillingTarget.js";
import type { CreateBillingPayload } from "./types/CreateBillingPayload.js";
import { buildUtcDate } from "./utils/buildUtcDate.js";
import { R2GenericUploadService } from "../file/r2/r2-upload-generic.js";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../config/database.js";
import type { BillingParties } from "./types/BillingParties.js";
import { billingListSelect } from "./queries/billingListSelect.js";
import { mapBillingListItem } from "./mappers/mapBillingListItem.js";
import type { billingSummaryPayload, listBillingPayload } from "./schemas/listBillingSchema.js";
import { endOfDay, startOfDay } from "./utils/scheduleAdjustment.js";
import { parseYMDToLocalDate } from "../../utils/parseYMDToLocalDate.js";
import { toDateOnly } from "../../utils/toDateOnly.js";
import { getVisibilityScope } from "../../utils/visibilityFilter.js";
import { mapBillingSummary } from "./mappers/mapBillingSummary.js";
import type { CorrectBillingReleaseInput } from "./types/CorrectBillingReleaseInput.js";
import type { approveLaunchPayload, rejectLaunchPayload } from "./schemas/launchActionsSchema.js";

export async function createBilling(tx: Prisma.TransactionClient, payload: CreateBillingPayload, parties: BillingParties, target: BillingTarget) {
    const { billing, billingFiles } = payload;
    const { sessionId, evolutionId, ataId } = target;
    const inicio_em = buildUtcDate(billing.dataSessao, billing.horarioInicio);
    const fim_em = buildUtcDate(billing.dataSessao, billing.horarioFim);

    const createdBilling = await tx.faturamento.create({
        data: {
            cliente_id: parties.clienteId,
            terapeuta_id: parties.terapeutaId,
            status: faturamento_status.pendente,
            inicio_em,
            fim_em,
            tipo_atendimento: billing.tipoAtendimento,
            ajuda_custo: billing.ajudaCusto,
            observacao_faturamento: billing.observacaoFaturamento,
            sessao_id: sessionId ?? null,
            evolucao_id: evolutionId ?? null,
            ata_id: ataId ?? null,
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

export async function listBilling(params: listBillingPayload, userId: string) {
    const { q, clienteId, status, dataInicio, dataFim, orderBy, page, pageSize } = params;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const visibility = await getVisibilityScope(userId);

    const where: Prisma.faturamentoWhereInput = {
        criado_em: {
            ...(dataInicio && { gte: startOfDay(parseYMDToLocalDate(toDateOnly(dataInicio))) }),
            ...(dataFim && { lte: endOfDay(parseYMDToLocalDate(toDateOnly(dataFim))) }),
        },
        ...(status && { status }),
        ...(q && { cliente: { nome: { contains: q } } }),
        ...(clienteId && { cliente_id: clienteId })
    };

    if (visibility.scope === 'none') {
        where.id = { equals: -1 };
    } 
    
    if (visibility.scope === 'partial') {
        where.terapeuta_id = { in: visibility.therapistIds };
    } 
    
    const [items, total] = await prisma.$transaction([
        prisma.faturamento.findMany({
            where,
            select: billingListSelect,
            skip,
            take,
            orderBy,
        }),
        prisma.faturamento.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
        items: items.map(mapBillingListItem),
        total,
        page: page,
        pageSize: pageSize,
        totalPages,
    }
}

export async function getBillingSummary(params: billingSummaryPayload) {
    const { terapeutaId, dataInicio, dataFim } = params;
    const where: Prisma.faturamentoWhereInput = {
        criado_em: {
            ...(dataInicio && { gte: startOfDay(parseYMDToLocalDate(toDateOnly(dataInicio))) }),
            ...(dataFim && { lte: endOfDay(parseYMDToLocalDate(toDateOnly(dataFim))) }),
        },
        terapeuta_id: terapeutaId,
    };

    const data = await prisma.faturamento.findMany({
        where,
        select: {
            inicio_em: true,
            fim_em: true,
            tipo_atendimento: true,
            status: true,
            valor_ajuda_custo: true,
            terapeuta_id: true,
            cliente: {
                select: {
                    terapeuta: {
                        select: {
                            terapeuta_id: true,
                            valor_sessao_consultorio: true,
                            valor_sessao_homecare: true,
                            valor_hora_desenvolvimento_materiais: true,
                            valor_hora_supervisao_recebida: true,
                            valor_hora_supervisao_dada: true,
                            valor_hora_reuniao: true,
                        },
                    },
                },
            },
        },
    });

    return mapBillingSummary(data);
}

export async function correctBillingRelease(input: CorrectBillingReleaseInput) {
    const { launchId, userId, billing, billingFiles, existingFiles, tipoAtividade, comentario } = input;

    const inicio_em = buildUtcDate(billing.dataSessao, billing.horarioInicio);
    const fim_em = buildUtcDate(billing.dataSessao, billing.horarioFim);
    const tipo_atendimento = tipoAtividade ?? billing.tipoAtendimento;

    return await prisma.$transaction(async (tx) => {
        const existing = await tx.faturamento.findFirst({
            where: {
                id: launchId,
                terapeuta_id: userId,
            },
            select: { id: true },
        });

        if (!existing) {
            throw new AppError('BILLING_NOT_FOUND', 'Lançamento não encontrado', 404);
        }

        await tx.faturamento.update({
            where: { id: launchId },
            data: {
                inicio_em,
                fim_em,
                tipo_atendimento,
                ajuda_custo: billing.ajudaCusto ?? true,
                observacao_faturamento: billing.observacaoFaturamento,
                motivo_rejeicao: comentario,
                status: faturamento_status.pendente,
            },
        });

        const toRemove = existingFiles.filter((file) => file.remove).map((file) => file.id);
        if (toRemove.length > 0) {
            await tx.faturamento_arquivo.deleteMany({
                where: {
                    faturamento_id: launchId,
                    id: { in: toRemove },
                },
            });
        }

        if (billingFiles.length === 0) {
            return { success: true, message: 'Faturamento corrigido com sucesso.' };
        }

        const uploaded = await R2GenericUploadService.uploadMany({
            prefix: `faturamentos/${launchId}`,
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
                    faturamento_id: launchId,
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

        return;
    });
}

export async function approveLaunch(launchId: number, params: approveLaunchPayload) {
    const { valorAjudaCusto } = params;

    const approve = await prisma.faturamento.update({
        where: { id: launchId },
        data: {
            valor_ajuda_custo: valorAjudaCusto ?? null,
            status: faturamento_status.aprovado, 
        },
        select: billingListSelect,
    });

    return mapBillingListItem(approve);
} 

export async function rejectLaunch(launchId: number, params: rejectLaunchPayload) {
    const { motivo } = params;

    const reject = await prisma.faturamento.update({
        where: { id: launchId },
        data: {
            motivo_rejeicao: motivo,
            status: faturamento_status.rejeitado,
        },
        select: billingListSelect,
    });

    return mapBillingListItem(reject);
}

export async function approveReleases(launchIds: number[]) {
    await prisma.faturamento.updateMany({
        where: { id: { in: launchIds } },
        data: {
            status: faturamento_status.aprovado, 
        },
    });

    return;
}

// :/
export async function findBillingFileForDownload(fileId: number) {
    return await prisma.faturamento_arquivo.findUnique({
        where: { id: fileId },
        select: {
            id: true,
            nome: true,
            caminho: true,
            mime_type: true,
            tamanho: true,
            faturamento: {
                select: {
                    id: true,
                    sessao_id: true,
                    evolucao_id: true,
                }
            }
        }
    });
}