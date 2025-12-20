import type { NextFunction, Request, Response } from 'express';
import * as OcpService from './olp.service.js';
import * as OcpNormalizer from './olp.normalizer.js';
import { Prisma } from '@prisma/client';
import type { CreateProgramPayload, OcpDetailDTO, SessionDTO } from './types/olp.types.js';
import { listClientProgramsSchema, listSessionsByClientSchema } from '../../schemas/queries/listSessions.query.js';
import { sessionObservations } from '../../utils/sessionObservations.js';

import {
    getPhysioSessionData,
    calcActivityDuration,
    calcAutonomyByCategory,
    calcPerformanceLine,
    calcKpis,
    calcAttentionActivities,
} from './services/reports/physiotherapy/index.js';

import {
    getMusicSessionsData,
    calcMusicKpis,
    calcMusicPerformanceLine,
    prepareMusiEvolutionData,
    prepareMusiAttentionActivities,
    prepareMusiAutonomyByCategory,
    calcAverageAndTrend,
    fetchMusicSessionsForChart,
    mapMusicSessionToChartPoint,
} from './services/reports/musictherapy/index.js';

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

        const payload = {
            programId: Number(programId),
            patientId,
            therapistId,
            notes,
            attempts,
            files: uploadedFiles,
            area,
        };

        let session;

        switch (area) {
            case 'fonoaudiologia':
                session = await OcpService.createSpeechSession(payload);
                break;

            case 'terapia-ocupacional':
                session = await OcpService.createTOSession(payload);
                break;

            case 'fisioterapia':
            case 'psicomotricidade':
            case 'educacao-fisica':
                session = await OcpService.createPhysiotherapySession(payload);
                break;

            case 'musicoterapia':
                session = await OcpService.createMusictherapySession(payload);
                break;

            default:
                session = [];
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

        return res.status(201).json({ data: OcpNormalizer.mapOcpDetail(ocp as unknown as OcpDetailDTO) });
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
    const query = listClientProgramsSchema.parse(req.query);
    const { clientId } = req.params;
    const { q, status, sort, page, area } = query;
    const userId = req.user?.id;

    if (!clientId) return res.status(400).json({ success: false, message: 'ClientId é obrigatório' });
    if (!userId) return res.status(400).json({ success: false, message: 'Id do usuário é obrigatório' });

    const rows = await OcpService.listProgramsByClientId(clientId, userId, page, 10, area, status, q, sort);

    return res.json({ success: true, data: rows.map(OcpNormalizer.mapOcpReturn) });
}

export async function listSessionsByClient(req: Request, res: Response) {
    try {
        const query = listSessionsByClientSchema.parse(req.query);
        const { clientId } = req.params;
        const { area, q, periodMode, programId, therapistId, sort, page, pageSize, stimulusId, periodStart, periodEnd } = query;

        if (!clientId) return res.status(400).json({ sucess: false, message: 'ID do paciente é obrigatório' });

        const result = await OcpService.listSessionsByClient({
            clientId,
            area,
            periodMode,
            sort,
            page,
            pageSize,
            q,
            programId,
            therapistId,
            stimulusId,
            periodStart,
            periodEnd,
        });

        return res.json({
            items: OcpNormalizer.mapSessionList(result.items as unknown as SessionDTO[]),
            total: result.total,
            totalPages: Math.ceil(result.total / pageSize),
        });
    } catch (error) {
        console.error('=== ERRO listSessionsByClient ===');
        console.error('Error:', error);
        console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
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
            return res.status(400).json({ error: "sessionIds é obrigatório e deve ser um array" });
        }
        
        const sessions = await getPhysioSessionData(sessionIds, stimulusIds || []);

        const result = {
            activityDuration: calcActivityDuration(sessions),
            autonomyByCategory: calcAutonomyByCategory(sessions),
            performance: calcPerformanceLine(sessions),
            attentionActivities: calcAttentionActivities(sessions),
            kpis: calcKpis(sessions),
            sessionObservations: await sessionObservations(sessions),
        };

        return res.json(result);
    } catch (error) {
        next (error);
    }
}

// Musictherapy reports
export async function musicKpis(req: Request, res: Response, next: NextFunction) {
    try {
        const { sessionIds, stimulusIds } = req.body;

        if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
            return res.status(400).json({ error: "sessionIds é obrigatório e deve ser um array" });
        }
        
        const sessions = await getMusicSessionsData(sessionIds, stimulusIds || []);
        
        const result = {
            kpis: calcMusicKpis(sessions),
            performance: calcMusicPerformanceLine(sessions),
            prepareMusiEvolutionData: prepareMusiEvolutionData(sessions),
            prepareMusiAttentionActivities: prepareMusiAttentionActivities(sessions),
            prepareMusiAutonomyByCategory: prepareMusiAutonomyByCategory(sessions),
            sessionObservations: await sessionObservations(sessions),
            calculateAverageAndTrend: {
                participation: calcAverageAndTrend(sessions, 'participacao'),
                support: calcAverageAndTrend(sessions, 'suporte'),
            },
        };

        return res.json(result);
    } catch (error) {
        next (error);
    }
}

export async function getMusicTherapyEvolutionChart(req: Request, res: Response, next: NextFunction) {
    try {
        const programId = getQueryString(req.query.programId);
        const stimulusId = getQueryString(req.query.stimulusId);
        const sort = getQueryString(req.query.sort) === 'desc' ? 'desc' : 'asc';

        if (!programId) return res.status(400).json({ success: false, message: 'programId é obrigatório' });

        const sessions = await fetchMusicSessionsForChart(programId, stimulusId, sort);

        const chartData = sessions.map(mapMusicSessionToChartPoint);

        return res.status(201).json({ data: chartData });
    } catch (error) {
        next (error)
    }
}