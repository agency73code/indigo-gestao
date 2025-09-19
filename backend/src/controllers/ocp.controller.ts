import type { Request, Response } from 'express';
import * as OcpService from '../features/ocp/ocp.service.js';

export async function create(req: Request, res: Response) {
    console.log("Body recebido no createOcpHandler:", req.body);
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