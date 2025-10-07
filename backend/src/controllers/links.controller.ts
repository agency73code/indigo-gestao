import type { NextFunction, Request, Response } from 'express';
import * as LinkService from '../features/links/links.service.js';
import * as LinkNormalizer from '../features/links/links.normalizer.js';
import * as LinkTypes from '../features/links/links.types.js';

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
            coTherapistActuation: body.coTherapistActuation,
        });

        const normalized = LinkNormalizer.normalizeLink(created);
        res.status(201).json(normalized);
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
        const data = await LinkService.getAllClients();        
        const normalized = LinkNormalizer.getAllClients(data);
        res.json(normalized);
    } catch (err) {
        next(err)
    }
}

export async function getAllTherapists(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await LinkService.getAllTherapists();
        const normalized = LinkNormalizer.getAllTherapists(data);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}

export async function getAllLinks(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await LinkService.getAllLinks();
        const normalized = LinkNormalizer.getAllLinks(data);
        res.json(normalized);
    } catch (err) {
        next(err);
    }
}