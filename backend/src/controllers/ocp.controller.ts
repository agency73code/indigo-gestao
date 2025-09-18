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

    const rows = await OcpService.listClientsByTherapist(user.id);
    return res.json({ success: true, data: rows.map(OcpService.mapClientReturn) })
}