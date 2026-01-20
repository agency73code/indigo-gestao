import type { Request, Response, NextFunction } from 'express';
import * as anamneseService from '../features/anamnese/anamnese.service.js';
import { AnamneseSchema } from '../schemas/anamnese.schema.js';
import {
    anamneseArquivoIdSchema,
    anamneseIdSchema,
    anamneseListSchema,
} from '../schemas/queries/anamnese.schema.js';
import type { AnamneseListFilters } from '../features/anamnese/anamnese.types.js';
import { R2GenericUploadService } from '../features/file/r2/r2-upload-generic.js';
import * as FilesService from '../features/file/files.service.js';
import { getFileStreamFromR2 } from '../features/file/r2/getFileStream.js';
import { extension as mimeExtension } from 'mime-types';
import path from 'path';

function resolveDownloadFilename(
    baseName: string,
    fallbackPath: string | null | undefined,
    mimeType?: string | null,
) {
    const normalizedBase = baseName.trim() || 'arquivo';
    const currentExt = path.extname(normalizedBase);

    if (currentExt) {
        return normalizedBase;
    }

    const fallbackExt = fallbackPath ? path.extname(fallbackPath) : '';
    if (fallbackExt) {
        return `${normalizedBase}${fallbackExt}`;
    }

    const mimeExt = mimeType ? mimeExtension(mimeType) : false;
    if (typeof mimeExt === 'string' && mimeExt.length > 0) {
        return `${normalizedBase}.${mimeExt}`;
    }

    return normalizedBase;
}

function sanitizeHeaderFilename(name: string): string {
    // remove CR/LF e aspas que quebram header
    return name.replace(/[\r\n"]/g, '_');
}

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
        const parsed = anamneseIdSchema.parse(req.params);
        const rawPayload = req.body?.payload ?? req.body;

        if (!rawPayload) {
            return res.status(400).json({
                success: false,
                message: 'Campo "payload" é obrigatório.',
            });
        }

        const parsedPayload =
            typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
        const payload = AnamneseSchema.parse(parsedPayload);

        if (!payload?.cabecalho?.clienteId || !payload?.cabecalho?.profissionalId) {
            return res.status(400).json({
                success: false,
                message: 'clienteId e profissionalId são obrigatórios.',
            });
        }

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
                idToKey.set(fileId, uploaded.key);
            }
        }

        const exames = payload.queixaDiagnostico?.examesPrevios ?? [];
        for (const exame of exames) {
            const arquivos = exame?.arquivos ?? [];
            for (const arq of arquivos) {
                if (!arq) continue;
                const fileId = arq?.id as string | null | undefined;
                const key = fileId ? idToKey.get(fileId) : undefined;

                if (key) {
                    arq.caminho = key;
                    continue;
                }

                const existingPath = (arq as { caminho?: string | null; url?: string | null }).caminho
                    ?? (arq as { url?: string | null }).url
                    ?? null;
                if (!arq.caminho) {
                    arq.caminho = existingPath;
                }
            }
        }

        const updated = await anamneseService.updateAnamneseById(parsed.id, payload);

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Anamnese não encontrada' });
        }

        return res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
}

export async function downloadExamePrevioArquivo(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Não autenticado' });
        }

        const parsed = anamneseArquivoIdSchema.parse(req.params);
        const arquivo = await anamneseService.getExamePrevioArquivoForDownload(
            parsed.id,
            parsed.arquivoId,
            req.user.id,
        );

        if (!arquivo) {
            return res.status(404).json({ success: false, message: 'Arquivo não encontrado' });
        }

        if (!arquivo.caminho) {
            return res.status(404).json({ success: false, message: 'Arquivo sem caminho válido' });
        }

        const { metadata, stream } = await getFileStreamFromR2(arquivo.caminho);

        if (!stream) {
            return res.status(500).json({ success: false, message: 'Falha ao obter arquivo' });
        }

        const dbArquivo = arquivo.caminho ? await FilesService.findFileByStorageId(arquivo.caminho) : null;
        const mimeType = dbArquivo?.tipo ?? metadata.mimeType;
        const filename = resolveDownloadFilename(
            dbArquivo?.nome ?? metadata.name,
            arquivo.caminho ?? metadata.name,
            mimeType,
        );
        const safeFilename = sanitizeHeaderFilename(filename);

        res.setHeader('Content-Type', mimeType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`,
        );

        (stream as NodeJS.ReadableStream).on('error', (err) => {
            console.error('Erro ao baixar arquivo de exame prévio:', err);
            res.sendStatus(500);
        });

        return (stream as NodeJS.ReadableStream).pipe(res);
    } catch (err) {
        return next(err);
    }
}