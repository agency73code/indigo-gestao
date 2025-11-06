import type { NextFunction, Request, Response } from 'express';
import * as LinkService from '../features/links/old/links.service.js';
import * as LinkNormalizer from '../features/links/old/links.normalizer.js';
import * as LinkTypes from '../features/links/old/links.types.js';

export async function createLink(req: Request<unknown, unknown, LinkTypes.CreateLink>, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        const created = await LinkService.createLink({
            patientId: body.patientId,
            therapistId: body.therapistId,
            role: body.role,
            startDate: body.startDate,
            endDate: body.endDate,
            notes: body.notes,
            actuationArea: body.actuationArea,
        });

        const normalized = LinkNormalizer.normalizeLink(created);
        res.status(201).json(normalized);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller responsável por atualizar um vínculo entre cliente e terapeuta existente.
 * Em caso de sucesso, retorna o vínculo atualizado já normalizado.
 * Em caso de erro, propaga um AppError adequado para tratamento pelo middleware global.
 */
export async function updateLink(req: Request<unknown, unknown, LinkTypes.UpdateLink>, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        const updated = await LinkService.updateLink({
            id: body.id,
            role: body.role,
            startDate: body.startDate,
            endDate: body.endDate,
            notes: body.notes,
            status: body.status,
            actuationArea: body.actuationArea,
        });

        const normalized = LinkNormalizer.normalizeLink(updated);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

export async function endLink(req: Request<unknown, unknown, LinkTypes.EndLink>, res: Response, next: NextFunction) {
    try {
        const { id, endDate } = req.body;
        const ended = await LinkService.endLink({ id, endDate });
        const normalized = LinkNormalizer.normalizeLink(ended);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

export async function archiveLink(req: Request<unknown, unknown, LinkTypes.ArchiveLink>, res: Response, next: NextFunction ) {
    try {
        const { id } = req.body;
        const archived = await LinkService.archiveLink({ id });
        const normalized = LinkNormalizer.normalizeLink(archived);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

export async function transferResponsible(req: Request<unknown, unknown, LinkTypes.TransferResponsible>, res: Response, next: NextFunction) {
    try {
        const result = await LinkService.transferResponsible(req.body);
        const normalized = {
            newResponsible: LinkNormalizer.normalizeLink(result.newResponsible),
            previousResponsible: LinkNormalizer.normalizeLink(result.previousResponsible),
        };

        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

export async function getAllClients(req: Request, res: Response, next: NextFunction) {
    try {
        const { search = '' } = req.query;

        const data = await LinkService.getAllClients(req.user!.id, search.toString());
        const normalized = LinkNormalizer.getAllClients(data);
        res.json(normalized);
    } catch (err) {
        next(err)
    }
}

export async function getAllTherapists(req: Request, res: Response, next: NextFunction) {
    try {
        const { search = '', role } = req.query;
        const data = await LinkService.getAllTherapists(req.user!.id, search.toString(), role?.toString());
        const normalized = LinkNormalizer.getAllTherapists(data);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller responsável por listar todos os vínculos entre clientes e terapeutas,
 * aplicando filtros opcionais recebidos via query string (ex: status, terapeuta, paciente, etc).
 * Em caso de sucesso, retorna a lista de vínculos já normalizados.
 * Em caso de erro, propaga um AppError adequado para tratamento pelo middleware global.
 */
export async function getAllLinks(req: Request, res: Response, next: NextFunction) {
    try {
        const filters = { ...req.query };
        const data = await LinkService.getAllLinks(req.user!.id, filters);
        const normalized = LinkNormalizer.getAllLinks(data);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}
