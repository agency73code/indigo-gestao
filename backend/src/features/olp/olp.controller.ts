import type { NextFunction, Request, Response } from 'express';
import * as OcpService from './olp.service.js';
import * as OcpNormalizer from './olp.normalizer.js';
import { Prisma } from '@prisma/client';
import type { CreateProgramPayload } from './types/olp.types.js';
import { getPhysioSessionData } from './services/reports/physiotherapy/getPhysioSessionData.js';
import { calcActivityDuration } from './services/reports/physiotherapy/activityDurationData.js';
import { calcAutonomyByCategory } from './services/reports/physiotherapy/autonomyByCategory.js';
import { calcPerformanceLine } from './services/reports/physiotherapy/performanceLine.js';
import { calcKpis } from './services/reports/physiotherapy/calculateKpis.js';
import { calcAttentionActivities } from './services/reports/physiotherapy/attentionActivities.js';

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
                message:
                    'Há estímulos duplicados na lista. Verifique e remova os repetidos antes de salvar.',
            });
        }

        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Erro inesperado',
        });
    }
}

export async function createAreaSession(req: Request, res: Response, next: NextFunction) {
    try {
        const { programId } = req.params;
        if (!programId) {
            return res
                .status(400)
                .json({ success: false, message: 'ID do programa não informado.' });
        }

        const therapistId = req.user?.id;
        if (!therapistId) {
            return res.status(400).json({ success: false, message: 'Usuário não autenticado.' });
        }

        const data = JSON.parse(req.body.data);
        const meta = req.body.filesMeta ? JSON.parse(req.body.filesMeta) : [];

        const { patientId, notes, attempts, area } = data;
        if (!patientId || !Array.isArray(attempts) || !area) {
            return res
                .status(400)
                .json({ success: false, message: 'Dados inválidos para criar sessão.' });
        }

        const uploadedFiles = ((req.files as Express.Multer.File[]) || []).map((file, i) => ({
            ...file,
            size: meta[i]?.size ?? file.size
        }));

        let session;

        switch(area) {
            case 'fonoaudiologia':
                session = await OcpService.createSpeechSession({
                    programId: Number(programId),
                    patientId,
                    therapistId,
                    notes,
                    attempts,
                    files: uploadedFiles,
                    area,
                });
                break;
            case 'terapia-ocupacional':
                session = await OcpService.createTOSession({
                    programId: Number(programId),
                    patientId,
                    therapistId,
                    notes,
                    attempts,
                    files: uploadedFiles,
                    area,
                });
                break;
            case 'fisioterapia':
            case 'psicomotricidade':
            case 'educacao-fisica':
                session = await OcpService.createPhysiotherapySession({
                    programId: Number(programId),
                    patientId,
                    therapistId,
                    notes,
                    attempts,
                    files: uploadedFiles,
                    area,
                });
                break;
            default:
                session = [];
                break;
        }

        return res.status(201).json(session);
    } catch (error) {
        next(error);
    }
}

export async function updateProgram(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.params.programId) return res.status(400).json({ success: false, message: 'ID do programa não informado' });
        const programId = parseInt(req.params.programId, 10);

        if (req.body.area === 'musicoterapia') {
            const ocp = await OcpService.updateMusicProgram(programId, req.body);
            if (!ocp) return res.status(404).json({ success: false, message: 'OCP não encontrado' });
            
            return res.status(200).json({ data: ocp });
        }

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
        if (!programId)
            return res
                .status(400)
                .json({ success: false, message: 'ID do programa não informado' });

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
        if (!req.params.programId)
            return res.status(400).json({ success: false, message: 'programId é obrigatório' });
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
    if (!clientId)
        return res.status(400).json({ success: false, message: 'clientId é obrigatório' });

    const patient = await OcpService.getClientById(clientId);
    if (!patient)
        return res.status(404).json({ success: false, message: 'Paciente não encontrado' });

    res.json({ data: patient });
}

export async function getProgramId(req: Request, res: Response) {
    try {
        const { programId } = req.params;
        if (!programId)
            return res.status(400).json({ success: false, message: 'programId é obrigatório' });

        const session = await OcpService.getProgramId(programId);
        if (!session)
            return res.status(404).json({ success: false, message: 'Programa não encontrada' });

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
    return res.json({ success: true, data: rows.map(OcpNormalizer.mapClientReturn) });
}

export async function listClientPrograms(req: Request, res: Response) {
    const { clientId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const status = (req.query.status as 'active' | 'archived' | 'all') || 'all';
    const q = req.query.q as string | undefined;
    const sort = (req.query.sort as 'recent' | 'alphabetic') ?? 'recent';
    const rawArea = req.query.area;
    const area = Array.isArray(rawArea) ? rawArea[0] : rawArea;
    const userId = req.user?.id;

    if (!clientId)
        return res.status(400).json({ success: false, message: 'ClientId é obrigatório' });
    if (typeof area !== 'string')
        return res.status(400).json({ success: false, message: 'Area é obrigatório' });
    if (!userId)
        return res.status(400).json({ success: false, message: 'Id do usuário é obrigatório' })

    const rows = await OcpService.listByClientId(clientId, userId, page, 10, area, status, q, sort);

    return res.json({ success: true, data: rows.map(OcpNormalizer.mapOcpReturn) });
}

export async function listSessionsByClient(req: Request, res: Response) {
    try {
        const { clientId } = req.params;
        if (!clientId)
            return res.status(400).json({ sucess: false, message: 'ID do paciente é obrigatório' });

        const area = getQueryString(req.query.area);
        if (!area) return res.status(400).json({ success: false, message: 'Area é obrigatório' });

        const therapistId = getQueryString(req.query.therapistId);
        const programId = getQueryString(req.query.programId);
        const periodMode = getQueryString(req.query.periodMode);
        const stimulusId = getQueryString(req.query.stimulusId);
        const periodStart = getQueryString(req.query.periodStart);
        const periodEnd = getQueryString(req.query.periodEnd);
        const sort = getQueryString(req.query.sort);

        const sessions = await OcpService.listSessionsByClient({
            clientId,
            area,
            periodMode,
            programId,
            therapistId,
            sort,
            stimulusId,
            periodStart,
            periodEnd,
        });

        return res.json({ data: OcpNormalizer.mapSessionList(sessions) });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: 'Erro ao  buscar sessões do cliente' });
    }
}

export async function getKpis(req: Request, res: Response) {
    try {
        const raw = decodeURIComponent(req.params.filters ?? '');
        const filtros = JSON.parse(raw);
        const data = await OcpService.getKpis(filtros);

        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar informações do relatório',
        });
    }
}

export async function getProgramsReport(req: Request, res: Response) {
    try {
        const clientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined;
        const area = typeof req.query.area === 'string' ? req.query.area : undefined;
        const stimulusId =
            typeof req.query.stimulusId === 'string' ? req.query.stimulusId : undefined;
        const therapistId =
            typeof req.query.therapistId === 'string' ? req.query.therapistId : undefined;

        const data = await OcpService.getProgramsReport(clientId, area, stimulusId, therapistId);
        res.json({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar informações do relatório',
        });
    }
}

export async function getStimulusReport(req: Request, res: Response) {
    try {
        const area = typeof req.query.area === 'string' ? req.query.area : undefined;
        const clientId = req.query.clientId as string | undefined;
        const programId = req.query.programId as string | undefined;
        const therapistId = req.query.therapistId as string | undefined;
        const data = await OcpService.getStimulusReport(clientId, programId, area, therapistId);

        res.json({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar informações do relatório',
        });
    }
}

export async function getAttentionStimuli(req: Request, res: Response) {
    try {
        const {
            programId,
            clientId,
            therapistId,
            periodMode,
            periodStart,
            periodEnd,
            lastSessions,
            area,
        } = req.query;

        const clientIdStr = getQueryString(clientId);
        const lastSessionsStr = getQueryString(lastSessions);
        const areaStr = getQueryString(area);
        const therapistIdStr = getQueryString(therapistId);
        const periodModeStr = getQueryString(periodMode);
        const periodStartStr = getQueryString(periodStart);
        const periodEndStr = getQueryString(periodEnd);
        const programIdStr = getQueryString(programId);

        if (!clientIdStr)
            return res.status(400).json({ success: false, message: 'Id do cliente é obrigatório' });
        if (!areaStr)
            return res.status(400).json({ success: false, message: 'Area é um campo obrigatório' });

        const parsedProgramId = programIdStr ? Number(programIdStr) : undefined;

        const parsedLastSessions: 1 | 3 | 5 =
            lastSessionsStr === '1'
                ? 1
                : lastSessionsStr === '3'
                  ? 3
                  : lastSessionsStr === '5'
                    ? 5
                    : 5;

        const parsedPeriodMode: '30d' | '90d' | 'custom' | undefined =
            periodModeStr === '30d' || periodModeStr === '90d' || periodModeStr === 'custom'
                ? periodModeStr
                : undefined;

        const data = await OcpService.getAttentionStimuli({
            clientId: clientIdStr,
            lastSessions: parsedLastSessions,
            area: areaStr,
            programId: parsedProgramId,
            therapistId: therapistIdStr,
            periodMode: parsedPeriodMode,
            periodStart: periodStartStr,
            periodEnd: periodEndStr,
        });

        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar estímulos que precisam de atenção',
        });
    }
}

function getQueryString(value: unknown): string | undefined {
    if (typeof value === 'string') return value;

    if (Array.isArray(value)) {
        const first = value[0];
        return typeof first === 'string' ? first : undefined;
    }

    return undefined;
}

// Physiotherapy reports
export async function physioKpis(req: Request, res: Response, next: NextFunction) {
    try {
        const { sessionIds, stimulusIds } = req.body;

        if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
            return res.status(400).json({
                error: "sessionIds é obrigatório e deve ser um array",
            });
        }
        
        const sessions = await getPhysioSessionData(sessionIds, stimulusIds || []);

        const result = {
            activityDuration: calcActivityDuration(sessions),
            autonomyByCategory: calcAutonomyByCategory(sessions),
            performance: calcPerformanceLine(sessions),
            attentionActivities: calcAttentionActivities(sessions),
            kpis: calcKpis(sessions),
        };

        return res.json(result);
    } catch (error) {
        next (error);
    }
}