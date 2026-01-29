import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError.js';
import { AIServiceError } from '../ai/ai.errors.js';
import { ataIdSchema, createAtaPayloadSchema, gerarResumoSchema, listAtaSchema, listTherapistSchema, updateAtaPayloadSchema } from './ata.schema.js';
import * as AtaService from './ata.service.js';
import { getAccessLevel } from '../../utils/getAccessLevel.js';
import { getFileStreamFromR2 } from '../file/r2/getFileStream.js';
import { unauthenticated } from '../../errors/unauthenticated.js';
import { buildBillingInputFromRequest } from '../billing/billing.controller.js';
import { idParam } from '../../schemas/utils/id.js';

/**
 * POST /atas-reuniao/ai/summary
 * Gera resumo completo da ata
 */
export async function handleGerarResumo(req: Request, res: Response, next: NextFunction) {
    try {
        const requester = req.user;
        if (!requester) {
            throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401);
        }

        const parsed = gerarResumoSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(
                'VALIDATION_ERROR',
                parsed.error.issues.map(e => e.message).join(', '),
                400
            );
        }

        const summary = await AtaService.gerarResumoCompleto(parsed.data);

        return res.json({ summary });
    } catch (error) {
        if (error instanceof AIServiceError) {
            return handleAIError(error, res);
        }
        next(error);
    }
}

/**
 * POST /atas-reuniao/ai/whatsapp-summary
 * Gera resumo curto para WhatsApp
 */
export async function handleGerarResumoWhatsApp(req: Request, res: Response, next: NextFunction) {
    try {
        const requester = req.user;
        if (!requester) {
            throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401);
        }

        const parsed = gerarResumoSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(
                'VALIDATION_ERROR',
                parsed.error.issues.map(e => e.message).join(', '),
                400
            );
        }

        const summary = await AtaService.gerarResumoWhatsApp(parsed.data);

        return res.json({ summary });
    } catch (error) {
        if (error instanceof AIServiceError) {
            return handleAIError(error, res);
        }
        next(error);
    }
}

export async function therapistsList(req: Request, res: Response, next: NextFunction) {
    try {
        const { atividade } = listTherapistSchema.parse(req.query);
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Não autenticado' });
        const data = await AtaService.therapistsList(userId, atividade);
        
        res.status(200).json(data);
    } catch(err) {
        next(err);
    }
}

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Não autenticado' });
        }

        const parsed = listAtaSchema.parse(req.query);
        const accessLevel = getAccessLevel(req.user.perfil_acesso);
        const canSeeAllTherapists = accessLevel >= 5;
        const therapistId = parsed.terapeuta_id ?? req.user.id;
        const therapistScopeId = parsed.terapeuta_id === undefined && canSeeAllTherapists ? null : therapistId;

        const result = await AtaService.list(therapistScopeId, {
            q: parsed.q,
            finalidade: parsed.finalidade,
            dataInicio: parsed.data_inicio,
            dataFim: parsed.data_fim,
            clienteId: parsed.cliente_id,
            orderBy: parsed.order_by,
            page: parsed.page,
            pageSize: parsed.page_size,
        });

        return res.json({
            items: result.items,
            total: result.total,
            page: result.page,
            page_size: result.pageSize,
            total_pages: result.totalPages,
        });
    } catch (err) {
        next(err);
    }
}

export async function therapistData(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(401).json({ message: 'Não autenticado' });
        const data = await AtaService.therapistData(userId);
        
        res.status(200).json(data);
    } catch(err) {
        next(err);
    }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw unauthenticated();

        const parsed = JSON.parse(req.body?.payload);
        const payload = createAtaPayloadSchema.parse(parsed);

        const uploadedFiles = ((req.files as Express.Multer.File[]) || [])
            .filter(f => f.fieldname.startsWith("files["))
            .map((file) => {
                const id = file.fieldname.slice("files[".length, -1);

                const fileNames = (req.body?.fileNames ?? {}) as Record<string, string>;
                const nome = fileNames[id] ?? file.originalname ?? null;

                return { ...file, nome, size:file.size };
            });

        const billingInput = buildBillingInputFromRequest(req);

        // service
        const created = await AtaService.create({
            payload,
            billingInput,
            anexos: uploadedFiles,
        });

        return res.status(201).json(created);
    } catch(err) {
        next(err);
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw unauthenticated();

        const { id: ataId } = ataIdSchema.parse(req.params);

        const parsed = JSON.parse(req.body?.payload);
        const payload = updateAtaPayloadSchema.parse(parsed);

        const uploadedFiles = ((req.files as Express.Multer.File[]) || [])
            .filter(f => f.fieldname.startsWith("files["))
            .map((file) => {
                const id = file.fieldname.slice("files[".length, -1);

                const fileNames = (req.body?.fileNames ?? {}) as Record<string, string>;
                const nome = fileNames[id] ?? file.originalname ?? null;

                return { ...file, nome, size:file.size };
            });

        console.log('------------------ INIT ------------------');
        console.log(payload);
        console.log('------------------ END ------------------');

        // const updated = await AtaService.update({
        //     id: ataId,
        //     userId: req.user.id,
        //     payload,
        //     anexos,
        // });

        // if (!updated) {
        //     return res.status(404).json({ success: false, message: 'Ata não identificada' });
        // }

        return res.status(200).json(updated);
    } catch(err) {
        next(err);
    }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id: ataId } = ataIdSchema.parse(req.params);
        const userId = req.user?.id;
        if (!userId) throw unauthenticated();

        const result = await AtaService.getById(ataId, userId);
        if (!result) return res.status(401).json({ message: 'Ata não identificada' });

        return res.status(200).json({ success: true, data: result});
    } catch (err) {
        next(err)
    }
}

export async function finalizeAtaById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id: ataId } = ataIdSchema.parse(req.params);
        const userId = req.user?.id;
        if (!userId) return res.status(404).json({ message: 'Não autenticado' });

        const result = await AtaService.finalizeAtaById(ataId, userId);
        if (!result) return res.status(401).json({ message: 'Ata não identificada' });

        return res.status(200).json({ success: true, data: result});
    } catch (err) {
        next(err)
    }
}

export async function deleteArea(req: Request, res: Response, next: NextFunction) {
    try {
        const { id: ataId } = ataIdSchema.parse(req.params);
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Não autenticado' });

        const result = await AtaService.deleteAta(ataId, userId);

        if (result === 'FORBIDDEN') {
            return res.status(403).json({ success: false, message: 'Você não tem permissão para apagar esta ata' });
        }

        if (result === null) {
            return res.status(404).json({ success: false, message: 'Ata não encontrada' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        next(err);
    }
}

export async function fileDownload(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            throw new AppError('UNAUTHORIZED', 'Não autenticado', 401);
        }

        const { fileId } = idParam.parse(req.params);
        const anexo = await AtaService.fileDownload(fileId, req.user.id);

        if (!anexo) {
            throw new AppError('NOT_FOUND', 'Arquivo não encontrado', 404);
        }

        if (!anexo.caminho) {
            throw new AppError('INVALID_STATE', 'Arquivo sem caminho de storage', 500);
        }

        // Pegar stream + metadata do R2
        const { stream, metadata } = await getFileStreamFromR2(anexo.caminho);

        if (!stream) {
            throw new AppError('R2_DOWNLOAD_FAILED', 'Falha ao obter o arquivo', 500);
        }

        const filename = anexo.original_nome ?? 'Arquivo sem nome';
        const contentType = anexo.mime_type ?? metadata?.mimeType ?? 'application/octet-stream';

        res.setHeader('content-Type', contentType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        );
        res.setHeader('Cache-Control', 'no-store');

        (stream as NodeJS.ReadableStream).on('error', (err) => {
            console.error('R2 stream error:', err);
            if (!res.headersSent) res.sendStatus(500);
            else res.end();
        });

        return (stream as NodeJS.ReadableStream).pipe(res);
    } catch (err) {
        return next(err);
    }
}

// ============================================
// HELPERS
// ============================================

function handleAIError(error: AIServiceError, res: Response) {
    if (error.code === 'AI_EMPTY_RESPONSE') {
        return res.status(502).json({
            success: false,
            error: 'Não foi possível gerar o resumo. Tente novamente.',
        });
    }

    if (error.code === 'AI_CONFIG_ERROR') {
        return res.status(500).json({
            success: false,
            error: 'Serviço de IA indisponível.',
        });
    }

    return res.status(500).json({
        success: false,
        error: 'Erro ao processar solicitação de IA.',
    });
}
