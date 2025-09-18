import type { Request, Response } from 'express';
import { listClientsByTherapist, mapClientReturn } from '../features/ocp/ocp.service.js';

export async function listTherapistClients(req: Request, res: Response) {
    const user = req.user as Express.UserPayload | undefined;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const rows = await listClientsByTherapist(user.id);
    return res.json({ success: true, data: rows.map(mapClientReturn) })
}