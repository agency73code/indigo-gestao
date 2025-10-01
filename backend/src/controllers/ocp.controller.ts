import type { Request, Response } from 'express';
import * as OcpService from '../features/ocp/ocp.service.js';
import * as OcpNormalizer from '../features/ocp/ocp.normalizer.js';

export async function createProgram(req: Request, res: Response) {
    try {
        const ocp = await OcpService.createProgram(req.body);
        return res.status(201).json({ data: ocp });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            error: error instanceof Error ? error.message : 'Erro inesperado',
        });
    }
}

export async function createSession(req: Request, res: Response) {
    try {
        if (!req.params.programId) return res.status(400).json({ success: false, message: 'ID do programa não informado' });
        const programId = parseInt(req.params.programId, 10);

        const { patientId, attempts } = req.body;
        if (!patientId || !Array.isArray(attempts)) return res.status(400).json({ error: "Dados inválidos para criar sessão" });

        const therapistId = req.user?.id;
        if (!therapistId) return res.status(401).json({ error: "Usuário não autenticado" });

        const session = await OcpService.createSession({ programId, patientId, therapistId, attempts });
        res.status(201).json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erro ao registrar sessão' })
    }
}

export async function updateProgram(req: Request, res: Response) {
    try {
        if (!req.params.programId) return res.status(400).json({ success: false, message: 'ID do programa não informado' });
        const programId = parseInt(req.params.programId, 10);

        const ocp = await OcpService.updateProgram(programId, req.body);
        if (!ocp) return res.status(404).json({ success: false, message: 'OCP não encontrado' });

        return res.status(201).json({ data: ocp });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, message: 'Erro programa não encontrado' });
    }
}

export async function getProgramById(req: Request, res: Response) {
    try {
        const { programId } = req.params;
        if (!programId) return res.status(400).json({ success: false, message: 'ID do programa não informado' });

        const ocp = await OcpService.getProgramById(programId);
        if (!ocp) return res.status(404).json({ success: false, message: 'OCP não encontrado' });

        return res.status(201).json({ data: OcpNormalizer.mapOcpDetail(ocp) });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ success: false, message: 'Erro programa não encontrado' });
    }
}

export async function getSessionByProgram(req: Request, res: Response) {
    try {
        if (!req.params.programId) return res.status(400).json({ success: false, message: 'programId é obrigatório' });
        const programId = parseInt(req.params.programId, 10);
        const limit = parseInt(req.query.limit as string, 10) || 5;
        const sessions = await OcpService.getSessionsByProgram(programId, limit);
        res.json({ data: sessions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erro ao buscar sessões' });
    }
}

export async function getClientById(req: Request, res: Response) {
    const { clientId } = req.params;
    if (!clientId) return res.status(400).json({ success: false, message: 'clientId é obrigatório' });

    const patient = await OcpService.getClientById(clientId);
    if (!patient) return res.status(404).json({ success: false, message: 'Paciente não encontrado' });

    res.json({ data: patient });
}

export async function getProgramId(req: Request, res: Response) {
    try {
        const { programId } = req.params;
        if (!programId) return res.status(400).json({ success: false, message: 'programId é obrigatório' });
        
        const session = await OcpService.getProgramId(programId);
        if (!session) return res.status(404).json({ success: false, message: 'Programa não encontrada' });

        res.json({ data: session });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erro ao buscar sessão' });
    }
}

export async function listTherapistClients(req: Request, res: Response) {
    const user = req.user as Express.UserPayload | undefined;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const q = req.query.q as string | undefined;

    const rows = await OcpService.listClientsByTherapist(user.id, q);
    return res.json({ success: true, data: rows.map(OcpNormalizer.mapClientReturn) })
}

export async function listClientPrograms(req: Request, res: Response) {
    const { clientId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const status = (req.query.status as 'active' | 'archived' | 'all') || 'all';
    const q = req.query.q as string | undefined;
    const sort = (req.query.sort as 'recent' | 'alphabetic') ?? 'recent';

    if (!clientId) return res.status(400).json({ success: false, message: 'ClientId é obrigatório' });
    const rows = await OcpService.listByClientId(clientId, page, 10, status, q, sort);
    return res.json({ success: true, data: rows.map(OcpNormalizer.mapOcpReturn) });
}

export async function listSessionsByClient(req: Request, res: Response) {
    try {
        const { clientId } = req.params;
        if (!clientId) return res.status(400).json({ sucess: false, message: 'ID do paciente é obrigatório' });

        const sessions = await OcpService.listSessionsByClient(clientId);
        return res.json ({ data: OcpNormalizer.mapSessionList(sessions) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Erro ao  buscar sessões do cliente' });
    }
}

export async function getKpis(req: Request, res: Response) {
    try {
        const raw = decodeURIComponent(req.params.filters ?? "");
        const filtros = JSON.parse(raw);
        const data = await OcpService.getKpis(filtros);

        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar informações do relatório' 
        });
    }
}

export async function getProgramsReport(req: Request, res: Response) {
    try {
        const data = await OcpService.getProgramsReport();
        res.json({ data })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar informações do relatório' 
        });
    }
}

export async function getStimulusReport(req: Request, res: Response) {
    try {
        const data = await OcpService.getStimulusReport();
        res.json({ data })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar informações do relatório' 
        });
    }
}