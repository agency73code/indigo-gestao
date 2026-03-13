import type { NextFunction, Request, Response } from 'express';
import * as FilesService from './files.service.js';
import { collectIncomingFiles } from './utils/collectIncomingFiles.js';
import { getFileStreamFromR2 } from './r2/getFileStream.js';
import { createFolder } from './r2/createFolder.js';
import { normalizedBirthDate } from './types/files.normalizer.js';
import { R2GenericUploadService } from './r2/r2-upload-generic.js';
import { AppError } from '../../errors/AppError.js';
import { streamFileDownload } from './r2/streamDownloadResponse.js';
import { arquivoIdParamSchema } from './files.schema.js';
import { getVisibilityScope } from '../../utils/visibilityFilter.js';
import { canDownloadFile } from './utils/canDownloadFile.js';

/**
 * Controller responsável pelos uploads de arquivos.
 * Totalmente integrado ao novo fluxo de pastas no R2.
 */
export async function uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Não autenticado.' });
        }

        const { ownerType, ownerId, fullName, birthDate } = req.body as {
            ownerType: 'cliente' | 'terapeuta';
            ownerId: string;
            fullName: string;
            birthDate: string;
        };

        if (!ownerType || !ownerId) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
        }

        if (ownerType === 'terapeuta') {
            if (ownerId !== req.user.id) {
                return res.status(403).json({ error: 'Sem permissão para fazer upload para este terapeuta.' });
            }
        } else if (ownerType === 'cliente') {
            const visibility = await getVisibilityScope(req.user.id);
            const allowed = await canDownloadFile({
                file: { clienteId: ownerId, terapeutaId: null },
                userId: req.user.id,
                visibility,
            });
            if (!allowed) {
                return res.status(403).json({ error: 'Sem permissão para fazer upload para este cliente.' });
            }
        }

        const normalizeBodyString = (value: unknown) => {
            if (typeof value === 'string') {
                return value;
            }
            if (Array.isArray(value)) {
                const [first] = value;
                return typeof first === 'string' ? first : undefined;
            }
            return undefined;
        };

        const documentTypeFromBody = normalizeBodyString(
            (req.body as Record<string, unknown>).documentType,
        );
        const descricaoFromBody = normalizeBodyString(
            (req.body as Record<string, unknown>).descricao_documento,
        );
        const descricaoNormalizada = descricaoFromBody?.trim() ?? '';

        if (!fullName || !birthDate) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
        }

        const BirthDate = normalizedBirthDate(birthDate);

        const availableFiles = collectIncomingFiles(req);
        if (availableFiles.length === 0) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }

        const folderStructure = await createFolder(ownerType, fullName, BirthDate);

        const uploadPromises = availableFiles.map(({ file, documentType }) => {
            const tipoDocumento =
                documentTypeFromBody || documentType || file.fieldname || 'arquivo';
            const descricaoDocumento =
                tipoDocumento === 'outros' && descricaoNormalizada.length > 0
                    ? descricaoNormalizada
                    : undefined;
            return FilesService.uploadAndPersistFile({
                ownerType,
                ownerId,
                fullName,
                birthDate,
                documentType: tipoDocumento,
                documentDescription: descricaoDocumento ?? '',
                file,
                folderIds: folderStructure,
            });
        });

        const uploads = await Promise.all(uploadPromises);

        return res.json({ arquivos: uploads });
    } catch (error) {
        return next(error);
    }
}

/**
 * Lista arquivos de um cliente ou terapeuta.
 * Endpoint: GET /api/arquivos/novo-listar?ownerType=cliente&ownerId=123
 */
export async function listFiles(req: Request, res: Response) {
    try {
        const ownerType = req.query.ownerType as 'cliente' | 'terapeuta';
        const ownerId = req.query.ownerId as string;

        if (!ownerType || !ownerId) {
            return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
        }

        const files = await FilesService.listFiles(ownerType, ownerId);
        return res.json(files);
    } catch (error) {
        console.error('Erro ao listar arquivos:', error);
        return res.status(500).json({ error: 'Falha ao carregar arquivos.' });
    }
}

/**
 * Controller: streama um arquivo diretamente do R2 para o navegador.
 * Usa ID numérico do banco para evitar expor a chave do R2 na URL.
 */
export async function viewFile(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            throw new AppError('UNAUTHENTICATED', 'Não autenticado', 401);
        }

        const { id: fileId } = arquivoIdParamSchema.parse(req.params);

        const dbFile = await FilesService.findFileByIdAuthorized(fileId, req.user.id);
        if (!dbFile) {
            throw new AppError('FILE_NOT_FOUND', 'Arquivo não encontrado', 404);
        }

        const { metadata, stream } = await getFileStreamFromR2(dbFile.storage_id!);

        if (!stream) {
            throw new AppError('FILE_STREAM_ERROR', 'Falha ao obter stream do arquivo', 500);
        }

        const SAFE_INLINE_MIME_TYPES = new Set([
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'image/heic', 'image/heif', // Apple HEIC (iPhone)
            'application/pdf',
            'video/mp4', 'video/webm',
            'audio/mpeg', 'audio/ogg', 'audio/wav',
        ]);
        const safeMime = SAFE_INLINE_MIME_TYPES.has(metadata.mimeType)
            ? metadata.mimeType
            : 'application/octet-stream';

        res.setHeader('Content-Type', safeMime);
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
        res.setHeader('Cache-Control', 'private, max-age=300');

        (stream as NodeJS.ReadableStream).on('error', (err) => {
            console.error('Erro ao streamar arquivo:', err);
            res.sendStatus(500);
        });

        return (stream as NodeJS.ReadableStream).pipe(res);
    } catch (err) {
        return next(err);
    }
}

/**
 * download R2.
 */
export async function downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            throw new AppError('UNAUTHENTICATED', 'Não autenticado', 401);
        }

        const { id: fileId } = arquivoIdParamSchema.parse(req.params);
        
        // Busca no banco pelo ID lógico (seguro)
        const dbFile = await FilesService.findFileByIdAuthorized(fileId, req.user.id);
        if (!dbFile) {
            throw new AppError('FILE_NOT_FOUND', 'Arquivo não encontrado', 404);
        }

        if (!dbFile.storage_id) {
            throw new AppError('FILE_NO_STORAGE', 'Arquivo sem arquivo_id', 409);
        }

        await streamFileDownload(res, dbFile);
    } catch (err) {
        next(err);
    }
}

/**
 * Download de arquivo de sessão (tabela sessao_arquivo).
 */
export async function downloadSessionFile(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            throw new AppError('UNAUTHENTICATED', 'Não autenticado', 401);
        }

        const { id: fileId } = arquivoIdParamSchema.parse(req.params);

        const dbFile = await FilesService.findSessionFileForDownload(fileId, req.user.id);
        if (!dbFile) {
            throw new AppError('FILE_NOT_FOUND', 'Arquivo não encontrado', 404);
        }

        await streamFileDownload(res, dbFile);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: exclui um arquivo do banco e do Google R2.
 */
export async function deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            throw new AppError('UNAUTHENTICATED', 'Não autenticado', 401);
        }

        const { id: fileId } = arquivoIdParamSchema.parse(req.params);

        // Verifica existência e permissão antes de deletar (reutiliza mesma lógica de autorização do download)
        let authorized;
        try {
            authorized = await FilesService.findFileByIdAuthorized(fileId, req.user.id);
        } catch (err) {
            if (err instanceof AppError && err.code === 'REQUIRED_THERAPIST_REGISTER') {
                throw new AppError('FORBIDDEN', 'Sem permissão para excluir este arquivo', 403);
            }
            throw err;
        }

        if (!authorized) {
            throw new AppError('FILE_NOT_FOUND', 'Arquivo não encontrado', 404);
        }

        if (authorized.storage_id) {
            await FilesService.deleteFromR2(authorized.storage_id);
        }

        await FilesService.deleteFromDatabase(authorized.id);

        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
}

/**
 * Controller: retorna a foto de perfil do cliente/terapeuta.
 * Endpoint: GET /api/arquivos/getAvatar?ownerType=cliente&ownerId=123
 */
export async function getAvatar(req: Request, res: Response) {
    const ownerType = req.query.ownerType as 'cliente' | 'terapeuta';
    const ownerId = req.query.ownerId as string;

    if (!ownerType || !ownerId) {
        return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
    }

    try {
        // Busca os arquivos desse usuário
        const files = await FilesService.listFiles(ownerType, ownerId);

        // Localiza o arquivo de foto de perfil
        const avatar = files.find((f) => f.tipo_documento === 'fotoPerfil');
        if (!avatar) {
            return res.status(200).json({ avatarUrl: null });
        }

        const avatarUrl = `/api/arquivos/${avatar.id}/view`;
        return res.json({ avatarUrl });
    } catch (error) {
        console.error('Erro ao obter avatar:', error);
        return res.status(500).json({ error: 'Falha ao carregar foto de perfil.' });
    }
}

export async function uploadGenericToR2(req: Request, res: Response, next: NextFunction) {
    try {
        const prefix = typeof req.body?.prefix === 'string' ? req.body.prefix : undefined;

        const files = Array.isArray(req.files) ? req.files : [];
        if (!files.length) {
            return res.status(400).json({
                code: 'FILES_REQUIRED',
                message: 'Envie ao menos 1 arquivo.',
            });
        }

        const uploaded = await R2GenericUploadService.uploadMany({
            prefix,
            files: files.map((f) => ({
                buffer: f.buffer,
                mimetype: f.mimetype,
                originalname: f.originalname,
                size: f.size,
            })),
        });

        return res.status(201).json({ files: uploaded });
    } catch (err) {
        return next(err)
    }
}