import type { Request, Response, NextFunction } from "express";
import { z } from 'zod';
import { billingSchema } from "./billing.schema.js";
import type { BillingInput } from "./types/BillingInput.js";
import * as BillingService from './billing.service.js';
import { AppError } from '../../errors/AppError.js';
import { streamFileDownload } from '../file/r2/streamDownloadResponse.js';
import { billingSummarySchema, listBillingSchema } from "./schemas/listBillingSchema.js";
import { unauthenticated } from "../../errors/unauthenticated.js";
import { idParam } from "../../schemas/utils/id.js";
import { correctBillingDataSchema, existingBillingFilesSchema } from "./schemas/correctBillingSchema.js";
import { approveLaunchSchema, rejectLaunchSchema } from "./schemas/launchActionsSchema.js";

export function buildBillingInputFromRequest(req: Request): BillingInput {
    const data = JSON.parse(req.body.data);

    const allFiles = (req.files as Express.Multer.File[]) || [];

    const billingMeta = req.body.billingFilesMeta
        ? JSON.parse(req.body.billingFilesMeta)
        : [];
    
    const billingFilesRaw = allFiles
        .filter((file) => file.fieldname === 'billingFiles')

    const billingFiles = billingFilesRaw.map((file, i) => ({
        ...file,
        size:
            typeof billingMeta?.[i]?.size === 'number'
                ? billingMeta[i].size
                : file.size,
    }))

    const billing = billingSchema.parse(data.faturamento);

    return { billing, billingFiles };
}

export async function listBilling(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();

        const params = listBillingSchema.parse(req.query);
        const data = await BillingService.listBilling(params, userId);

        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
}

export async function getBillingSummary(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();

        const payload = billingSummarySchema.parse(req.query);
        const data = await BillingService.getBillingSummary(payload);

        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
}

export async function approveLaunch(req: Request, res: Response, next: NextFunction) {
    try {
        const launchId = idParam.parse(req.params.launchId);
        const payload = approveLaunchSchema.parse(req.body);

        const data = BillingService.approveLaunch(launchId, payload);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
}

export async function rejectLaunch(req: Request, res: Response, next: NextFunction) {
    try {
        const launchId = idParam.parse(req.params.launchId);
        const payload = rejectLaunchSchema.parse(req.body);

        const data = BillingService.rejectLaunch(launchId, payload);
        return res.status(201).json(data);
    } catch (err) {
        next(err);
    }
}

export async function correctBillingRelease(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();

        const launchId = idParam.parse(req.params.launchId);

        const payload = correctBillingDataSchema.parse(JSON.parse(req.body.data));

        const existingFiles = existingBillingFilesSchema
            .parse(req.body.existingFiles ? JSON.parse(req.body.existingFiles) : []);

        const allFiles = (req.files as Express.Multer.File[]) || [];
        const billingFiles = allFiles.filter((file) => file.fieldname === 'billingFiles');

        await BillingService.correctBillingRelease({
            launchId,
            userId,
            billing: payload.faturamento,
            billingFiles,
            existingFiles,
            tipoAtividade: payload.tipoAtividade,
            comentario: payload.comentario,
        });
        
        return res.status(201).json({ success: true, message: 'Faturamento corrigido com sucesso.' });
    } catch (err) {
        next(err);
    }
}

export async function approveReleases(req: Request, res: Response, next: NextFunction) {
    try {
        console.log(req.params);
        console.log(req.query);
        console.log(req.body);

        res.status(200).json({ success: 'sucesso' });
    } catch (err) {
        next(err);
    }
}

// :/
const fileIdSchema = z.object({
    fileId: z.string().transform((val) => parseInt(val, 10)),
});

export async function downloadBillingFile(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            throw new AppError('UNAUTHENTICATED', 'Não autenticado', 401);
        }

        const { fileId } = fileIdSchema.parse(req.params);
        const billingFile = await BillingService.findBillingFileForDownload(fileId);

        if (!billingFile) {
            throw new AppError('FILE_NOT_FOUND', 'Arquivo de faturamento não encontrado', 404);
        }

        if (!billingFile.caminho) {
            throw new AppError('FILE_NO_STORAGE', 'Arquivo sem caminho de storage', 500);
        }

        const fileForDownload = {
            id: billingFile.id,
            storage_id: billingFile.caminho,
            mime_type: billingFile.mime_type,
            name: billingFile.nome,
        };

        await streamFileDownload(res, fileForDownload);
    } catch (err) {
        next(err);
    }
}