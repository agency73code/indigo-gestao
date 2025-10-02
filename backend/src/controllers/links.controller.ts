import type { NextFunction, Request, Response } from 'express';
import * as LinkService from '../features/links/links.service.js';
import * as LinkNormalizer from '../features/links/links.normalizer.js';

export async function getAllClients(req: Request, res: Response, Next: NextFunction) {
    try {
        const data = await LinkService.getAllClients();
        const normalizer = await LinkNormalizer.getAllClients(data);
        res.json(normalizer);
    } catch (err) {
        Next(err)
    }
}