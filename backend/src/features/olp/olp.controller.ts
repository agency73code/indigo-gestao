import type { NextFunction, Request, Response } from 'express';
import * as OcpService from './olp.service.js';
import * as OcpNormalizer from './olp.normalizer.js';
import { Prisma } from '@prisma/client';
import type { AttentionStimuliFilters, CreateProgramPayload } from './types/olp.types.js';

export async function createProgram(req: Request, res: Response) {
    try {
        const body = req.body as CreateProgramPayload;

        if (!body.area) {
            return res.status(400).json({ error: 'Campo area é obrigatório' });
        }

        const ocp = await OcpService.createProgram(body);
        return res.status(201).json(ocp);
    } catch (error) {
        console.error('Erro ao criar programa:', error);

        // Detecta erro de restrição única
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(400).json({
            success: false,
            message: 'Há estímulos duplicados na lista. Verifique e remova os repetidos antes de salvar.',
        });
        }

        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Erro inesperado',
        });
    }
}

export async function createSession(req: Request, res: Response) {
    try {
        if (!req.params.programId) return res.status(400).json({ success: false, message: 'ID do programa não informado' });
        const programId = parseInt(req.params.programId, 10);

        const { patientId, notes, attempts } = req.body;
        if (!patientId || !Array.isArray(attempts)) return res.status(400).json({ error: "Dados inválidos para criar sessão" });

        const therapistId = req.user?.id;
        if (!therapistId) return res.status(401).json({ error: "Usuário não autenticado" });

        const session = await OcpService.createSession({ programId, patientId, therapistId, notes, attempts });
        res.status(201).json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erro ao registrar sessão' })
    }
}

export async function createTOSession(req: Request, res: Response, next: NextFunction) {
    try {
        const { programId } = req.params;
        if (!programId) {
            return res.status(400).json({ success: false, message: 'ID do programa não informado.' });
        }

        const therapistId = req.user?.id;
        if (!therapistId) {
            return res.status(400).json({ success: false, message: 'Usuário não autenticado.' });
        }

        const data = JSON.parse(req.body.data);

        const { patientId, notes, attempts, area } = data;
        if (!patientId || !Array.isArray(attempts) || !area) {
            return res.status(400).json({ success: false, message: 'Dados inválidos para criar sessão.' });
        }
        console.log(req.files);
        const uploadedFiles = req.files as Express.Multer.File[] || [];

        const session = await OcpService.createTOSession({
            programId: Number(programId),
            patientId,
            therapistId,
            notes,
            attempts,
            files: uploadedFiles,
            area
        });

        return res.status(201).json(session);
    } catch (error) {
        next(error);
    }
}

export async function updateProgram(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.params.programId) return res.status(400).json({ success: false, message: 'ID do programa não informado' });
        const programId = parseInt(req.params.programId, 10);

        const ocp = await OcpService.updateProgram(programId, req.body);
        if (!ocp) return res.status(404).json({ success: false, message: 'OCP não encontrado' });

        return res.status(200).json({ data: ocp });
    } catch (error) {
        next(error);
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
    const rawArea = req.query.area;
    const area = Array.isArray(rawArea) ? rawArea[0] : rawArea;

    if (!clientId) return res.status(400).json({ success: false, message: 'ClientId é obrigatório' });
    if (typeof area !== 'string') return res.status(400).json({ success: false, message: 'Area é obrigatório' });

    const rows = await OcpService.listByClientId(clientId, page, 10, area, status, q, sort);

    return res.json({ success: true, data: rows.map(OcpNormalizer.mapOcpReturn) });
}

export async function listSessionsByClient(req: Request, res: Response) {
    try {
        const { clientId } = req.params;
        if (!clientId) return res.status(400).json({ sucess: false, message: 'ID do paciente é obrigatório' });

        const rawArea = req.query.area;
        const area = Array.isArray(rawArea) ? rawArea[0] : rawArea;
        if (typeof area !== 'string') return res.status(400).json({ success: false, message: 'Area é obrigatório' });

        const rawTherapistId = req.query.therapistId;
        const therapistId: string | undefined =
            typeof rawTherapistId === 'string'
                ? rawTherapistId
                : req.user?.id;

        const sortParam = req.query.sort;
        const sort =
            sortParam === 'accuracy-asc' || sortParam === 'accuracy-desc'
                ? sortParam
                : 'recent';

        const sessions = await OcpService.listSessionsByClient(clientId, area, therapistId, sort);
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
        const clientId = typeof req.query.clientId === 'string'
            ? req.query.clientId
            : undefined;
        const area = typeof req.query.area === 'string' ? req.query.area : undefined;
        const stimulusId = typeof req.query.stimulusId === 'string' ? req.query.stimulusId : undefined;
        const therapistId = typeof req.query.therapistId === 'string' ? req.query.therapistId : undefined;

        const data = await OcpService.getProgramsReport(clientId, area, stimulusId, therapistId);
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
        const area = typeof req.query.area === 'string' ? req.query.area : undefined;
        const clientId = req.query.clientId as string | undefined;
        const programId = req.query.programaId as string | undefined;
        const therapistId = req.query.therapistId as string | undefined;
        const data = await OcpService.getStimulusReport(clientId, programId, area, therapistId);

        res.json({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false, 
            message: 'Erro ao buscar informações do relatório' 
        });
    }
}

export async function getAttentionStimuli(req: Request, res: Response) {
    try {
        const pacienteId = req.query.pacienteId as string | undefined;
        if (!pacienteId) {
            return res.status(400).json({
                success: false,
                message: 'pacienteId é obrigatório'
            });
        }

        const lastSessionsParam = parseInt(req.query.lastSessions as string, 10);
        const lastSessions: AttentionStimuliFilters['lastSessions'] = [1, 3, 5].includes(lastSessionsParam)
            ? (lastSessionsParam as AttentionStimuliFilters['lastSessions'])
            : 5;

        const filters: AttentionStimuliFilters = {
            pacienteId,
            lastSessions,
            programaId: typeof req.query.programaId === 'string' ? req.query.programaId : undefined,
            terapeutaId: typeof req.query.terapeutaId === 'string' ? req.query.terapeutaId : undefined,
        };

        const periodoMode = req.query.periodoMode as '30d' | '90d' | 'custom' | undefined;
        const periodoStart = req.query.periodoStart as string | undefined;
        const periodoEnd = req.query.periodoEnd as string | undefined;

        if (periodoMode) {
            filters.periodo = {
                mode: periodoMode,
                start: periodoStart,
                end: periodoEnd,
            };
        }

        const data = await OcpService.getAttentionStimuli(filters);

        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar estímulos que precisam de atenção'
        });
    }
}