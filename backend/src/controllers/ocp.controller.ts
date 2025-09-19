import type { Request, Response } from 'express';
import * as OcpService from '../features/ocp/ocp.service.js';
import { mapOcpDetail } from '../features/ocp/ocp.normalizer.js';

export async function create(req: Request, res: Response) {
    try {
        const ocp = await OcpService.create(req.body);
        return res.status(201).json({ data: ocp });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            error: error instanceof Error ? error.message : 'Erro inesperado',
        });
    }
}

export async function getProgramById(req: Request, res: Response) {
    try {
        const { programId } = req.params;
        if (!programId) return res.status(400).json({ success: false, message: 'ID do programa não informado' });

        const ocp = await OcpService.get(programId);
        if (!ocp) return res.status(404).json({ message: 'OCP not found' });
        
        return res.status(201).json({ data: mapOcpDetail(ocp) });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, message: 'Erro programa não encontrado' });
    }
}

export async function listTherapistClients(req: Request, res: Response) {
    const user = req.user as Express.UserPayload | undefined;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const q = req.query.q as string | undefined;

    const rows = await OcpService.listClientsByTherapist(user.id, q);
    return res.json({ success: true, data: rows.map(OcpService.mapClientReturn) })
}

export async function listClientPrograms(req: Request, res: Response) {
    const { clientId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const status = (req.query.status as 'active' | 'archived' | 'all') || 'all';
    const q = req.query.q as string | undefined;
    const sort = (req.query.sort as 'recent' | 'alphabetic') ?? 'recent';

    if (!clientId) return res.status(400).json({ success: false, message: 'ClientId é obrigatório' });
    const rows = await OcpService.listByClientId(clientId, page, 10, status, q, sort);
    return res.json({ success: true, data: rows.map(OcpService.mapOcpReturn) });
}