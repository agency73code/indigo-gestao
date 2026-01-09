import type { Request, Response, NextFunction } from 'express';
import * as anamneseService from '../features/anamnese/anamnese.service.js';
import { AnamneseSchema } from '../schemas/anamnese.schema.js';
import { anamneseIdSchema, anamneseListSchema } from '../schemas/queries/anamnese.schema.js';
import type { AnamneseListFilters } from '../features/anamnese/anamnese.types.js';
import { R2GenericUploadService } from '../features/file/r2/r2-upload-generic.js';

function extractFileId(fieldname: string): string | null {
    // espera "files[<id>]"
    const m = /^files\[(.+)\]$/.exec(fieldname);
    return m?.[1] ?? null;
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const rawPayload = req.body?.payload;

        if (typeof rawPayload !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Campo "payload" é obrigatório (JSON string).',
            });
        }

        const parsedPayload = JSON.parse(rawPayload);
        const payload = AnamneseSchema.parse(parsedPayload);

        if (!payload?.cabecalho?.clienteId || !payload?.cabecalho?.profissionalId) {
            return res.status(400).json({
                success: false,
                message: 'clienteId e profissionalId são obrigatórios.',
            });
        }

        // mapeia uploads: id -> key
        const files = (Array.isArray(req.files) ? req.files : []) as Express.Multer.File[];
        const idToKey = new Map<string, string>();

        for (const f of files) {
            const fileId = extractFileId(f.fieldname);
            if (!fileId) continue;

            const [uploaded] = await R2GenericUploadService.uploadMany({
                prefix: `anamneses/exames-previos/${payload.cabecalho.clienteId}`,
                files: [
                    {
                        buffer: f.buffer,
                        mimetype: f.mimetype,
                        originalname: f.originalname,
                        size: f.size,
                    },
                ],
            });

            if (uploaded) {
                idToKey.set(fileId, uploaded.key)
            }
        }

        // injeta caminho nos exames prévios
        const exames = payload.queixaDiagnostico?.examesPrevios ?? [];
        for (const exame of exames) {
            const arquivos = exame?.arquivos ?? [];
            for (const arq of arquivos) {
                const fileId = arq?.id as string | null | undefined;
                const key = fileId ? idToKey.get(fileId) : undefined;

                arq.caminho = key ?? null;
            }
        }

        console.log(payload.queixaDiagnostico)
        console.log(exames)

        // chama o service já com caminho preenchido
        const created = await anamneseService.create(payload);

        return res.status(201).json({
            success: true,
            data: created,
            message: 'Anamnese criada com sucesso.',
        });
    } catch (err) {
        next(err);
    }
}

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return res
                .status(400)
                .json({ success: false, message: 'ID do terapeuta é obrigatório!' });
        }

        const parsed = anamneseListSchema.parse(req.query);
        const filters: AnamneseListFilters = {
            q: parsed.q,
            sort: parsed.sort,
            page: parsed.page,
            pageSize: parsed.pageSize,
        };

        const result = await anamneseService.list(req.user.id, filters);

        return res.json({
            items: result.items,
            total: result.total,
            page: result.page,
            pageSize: result.pageSize,
            totalPages: result.totalPages,
        });
    } catch (err) {
        next(err);
    }
}

export async function getAnamneseById(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = anamneseIdSchema.parse(req.params);
        
        const result = await anamneseService.getAnamneseById(parsed.id);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Anamnese não encontrada' });
        }

        return res.json(result);
    } catch (err) {
        return next(err)
    }
}

export async function updateAnamneseById(req: Request, res: Response, next: NextFunction) {
    try {
        res.status(201).json({ success: true, message: 'deu certo' })
    } catch (err) {
        next(err);
    }
}