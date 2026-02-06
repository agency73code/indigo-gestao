import type { NextFunction, Request, Response } from 'express';
import * as LinkService from '../features/links/old/links.service.js';
import * as LinkNormalizer from '../features/links/old/links.normalizer.js';
import * as LinkTypes from '../features/links/old/links.types.js';
import { clientListSchema, clientOptionsSchema } from '../schemas/queries/client.schema.js';
import { therapistListQuerySchema, therapistSelectQuerySchema } from '../schemas/queries/therapists.schema.js';
import { linksSchema, linksUpdateSchema, transferResponsibleSchema } from '../features/links/links.schema.js';
import { listLinksSchema } from '../features/links/schemas/listLinks.js';
import { unauthenticated } from '../errors/unauthenticated.js';

export async function createLink(req: Request, res: Response, next: NextFunction) {
    try {
        const payload = linksSchema.parse(req.body);
        const created = await LinkService.createLink(payload);

        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller responsável por atualizar um vínculo entre cliente e terapeuta existente.
 * Em caso de sucesso, retorna o vínculo atualizado já normalizado.
 * Em caso de erro, propaga um AppError adequado para tratamento pelo middleware global.
 */
export async function updateLink(req: Request, res: Response, next: NextFunction) {
    try {
        const payload = linksUpdateSchema.parse(req.body);
        const updated = await LinkService.updateLink(payload);

        res.json(updated);
    } catch (err) {
        next(err);
    }
}

export async function endLink(
    req: Request<unknown, unknown, LinkTypes.EndLink>,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id, endDate } = req.body;
        const ended = await LinkService.endLink({ id, endDate });
        const normalized = LinkNormalizer.normalizeLink(ended);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

export async function archiveLink(
    req: Request<unknown, unknown, LinkTypes.ArchiveLink>,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id } = req.body;
        const archived = await LinkService.archiveLink({ id });
        const normalized = LinkNormalizer.normalizeLink(archived);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

export async function transferResponsible(req: Request, res: Response, next: NextFunction) {
    try {
        const payload = transferResponsibleSchema.parse(req.body);

        await LinkService.transferResponsible(payload);

        res.status(201).json({ message: 'Transaferencia realizada com sucesso' });
    } catch (err) {
        next(err);
    }
}

export async function getClientOptions(req: Request, res: Response, next: NextFunction) {
    try {
        const { search, limit } = clientOptionsSchema.parse(req.query);

        const data = await LinkService.getClientOptions(req.user!.id, search, limit);
        const normalized = LinkNormalizer.normalizeClientOptions(data);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

export async function listClients(req: Request, res: Response, next: NextFunction) {
    try {
        const { search, includeResponsavel = false, limit } = clientListSchema.parse(req.query);
    
        const data = await LinkService.listClients(
            req.user!.id,
            search,
            includeResponsavel,
            limit,
        );
        const normalized = LinkNormalizer.normalizeClientList(data, includeResponsavel);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

export async function selectTherapists(req: Request, res: Response, next: NextFunction) {
    try {
        const query = therapistSelectQuerySchema.parse(req.query);
        const data = await LinkService.selectTherapists(req.user!.id, query);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function listTherapists(req: Request, res: Response, next: NextFunction) {
    try {
        const query = therapistListQuerySchema.parse(req.query);
        const data = await LinkService.listTherapists(req.user!.id, query);
        res.json(data);
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
        const userId = req.user!.id;
        if (!userId) throw unauthenticated();

        const filters = listLinksSchema.parse(req.query);
        const data = await LinkService.getAllLinks(userId, filters);

        res.json(data);
    } catch (err) {
        next(err);
    }
}
