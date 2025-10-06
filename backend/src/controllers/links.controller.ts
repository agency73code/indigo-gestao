import type { NextFunction, Request, Response } from 'express';
import * as LinkService from '../features/links/links.service.js';
import * as LinkNormalizer from '../features/links/links.normalizer.js';

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