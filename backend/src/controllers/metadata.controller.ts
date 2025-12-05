import type { Request, Response, NextFunction } from 'express';
import * as metadataService from '../features/metadata/metadata.service.js';

export async function getProfessionalMetadata(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await metadataService.listProfessionalMetada();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}
