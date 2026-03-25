import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError.js';
import { reportPayloadSchema, reportListQuerySchema } from '../../schemas/report.schema.js';
import { userCanSeeAllReports } from './report.utils.js';
import * as ReportService from './report.service.js';
import type { ReportListFilters } from './report.types.js';
import { getFileStreamFromR2 } from '../file/r2/getFileStream.js';

export async function saveReport(req: Request, res: Response, next: NextFunction) {
    try {
        const pdfFile = req.file as Express.Multer.File | undefined;
        const parsed = reportPayloadSchema.parse(req.body);
        const { data: structuredData, ...metadata } = parsed;

        const requester = req.user;
        if (!requester) {
            throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401);
        }

        if (!pdfFile) {
            throw new AppError(
                'REPORT_PDF_REQUIRED',
                'O arquivo PDF do relatório é obrigatório.',
                400,
            );
        }

        const canSeeAll = userCanSeeAllReports(requester.perfil_acesso);
        if (!canSeeAll && requester.id !== metadata.therapistId) {
            throw new AppError(
                'REPORT_FORBIDDEN',
                'Você só pode salvar relatórios vinculados ao seu usuário.',
                403,
            );
        }

        const saved = await ReportService.saveReport({
            title: metadata.title,
            type: metadata.type,
            status: metadata.status,
            area: metadata.area,
            patientId: metadata.patientId,
            therapistId: metadata.therapistId,
            periodStart: metadata.periodStart,
            periodEnd: metadata.periodEnd,
            ...(metadata.clinicalObservations && {
                clinicalObservations: metadata.clinicalObservations,
            }),
            data: structuredData,
            pdfFile,
        });

        return res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
}

export async function listReports(req: Request, res: Response, next: NextFunction) {
    try {
        const requester = req.user;
        if (!requester) {
            throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401);
        }

        const filters = reportListQuerySchema.parse(req.query);
        const canSeeAll = userCanSeeAllReports(requester.perfil_acesso);

        const normalizedFilters: ReportListFilters = {
            ...(filters.patientId && { patientId: filters.patientId }),
            ...(canSeeAll && filters.therapistId && { therapistId: filters.therapistId }),
            ...(filters.area && { area: filters.area }),
            ...(filters.startDate && { startDate: new Date(filters.startDate) }),
            ...(filters.endDate && { endDate: new Date(filters.endDate) }),
            ...(filters.status && filters.status !== 'all' && { status: filters.status }),
            ...(filters.type && filters.type !== 'all' && { type: filters.type }),
            ...(!canSeeAll && { restrictToTherapistId: requester.id }),
        };

        const reports = await ReportService.listReports(normalizedFilters);
        return res.json(reports);
    } catch (error) {
        next(error);
    }
}

export async function getReport(req: Request, res: Response, next: NextFunction) {
    try {
        const requester = req.user;
        if (!requester) {
            throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401);
        }

        const { id } = req.params;
        if (!id) {
            throw new AppError('INVALID_ID', 'Parâmetro id é obrigatório.', 400);
        }

        const report = await ReportService.getReportById(id);
        if (!report) {
            return res.status(404).json({ message: 'Relatório não encontrado.' });
        }

        const canSeeAll = userCanSeeAllReports(requester.perfil_acesso);
        if (!canSeeAll && report.therapistId !== requester.id) {
            throw new AppError(
                'REPORT_FORBIDDEN',
                'Você não tem permissão para visualizar este relatório.',
                403,
            );
        }

        return res.json(report);
    } catch (error) {
        next(error);
    }
}

export async function deleteReport(req: Request, res: Response, next: NextFunction) {
    try {
        const requester = req.user;
        if (!requester) {
            throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401);
        }

        const { id } = req.params;
        if (!id) {
            throw new AppError('INVALID_ID', 'Parâmetro id é obrigatório.', 400);
        }

        const reportRecord = await ReportService.getReportRecord(id);
        if (!reportRecord) {
            return res.status(404).json({ message: 'Relatório não encontrado.' });
        }

        const canSeeAll = userCanSeeAllReports(requester.perfil_acesso);
        if (!canSeeAll && reportRecord.terapeutaId !== requester.id) {
            throw new AppError(
                'REPORT_FORBIDDEN',
                'Você não tem permissão para excluir este relatório.',
                403,
            );
        }

        await ReportService.deleteReport({
            id: reportRecord.id,
            pdf_arquivo_id: reportRecord.pdf_arquivo_id,
        });
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function streamPdf(req: Request, res: Response, next: NextFunction) {
    try {
        const requester = req.user;
        if (!requester) {
            throw new AppError('AUTH_REQUIRED', 'Usuário não autenticado.', 401);
        }

        const { id } = req.params;
        if (!id) {
            throw new AppError('INVALID_ID', 'Parâmetro id é obrigatório.', 400);
        }

        const record = await ReportService.getReportRecord(id);
        if (!record) {
            throw new AppError('REPORT_NOT_FOUND', 'Relatório não encontrado.', 404);
        }

        const canSeeAll = userCanSeeAllReports(requester.perfil_acesso);
        if (!canSeeAll && record.terapeutaId !== requester.id) {
            throw new AppError('REPORT_FORBIDDEN', 'Você não tem permissão para acessar este relatório.', 403);
        }

        if (!record.pdf_arquivo_id) {
            throw new AppError('REPORT_NO_PDF', 'Este relatório não possui PDF.', 404);
        }

        const { metadata, stream } = await getFileStreamFromR2(record.pdf_arquivo_id);

        if (!stream) {
            throw new AppError('REPORT_STREAM_ERROR', 'Falha ao obter stream do PDF.', 500);
        }

        res.setHeader('Content-Type', metadata.mimeType || 'application/pdf');
        res.setHeader('Cache-Control', 'private, max-age=300');

        (stream as NodeJS.ReadableStream).on('error', () => res.sendStatus(500));
        return (stream as NodeJS.ReadableStream).pipe(res);
    } catch (error) {
        return next(error);
    }
}
