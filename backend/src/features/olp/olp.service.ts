import { prisma } from "../../config/database.js";
import { Prisma } from '@prisma/client'
import * as OcpType from "./types/olp.types.js";
import * as OcpNormalizer from './olp.normalizer.js';
import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { program, session } from "./actions/create.js";
import { programUpdate } from "./actions/update.js";
import { updateProgramSchema } from "./types/olp.schema.js";
import { getVisibilityScope } from "../../utils/visibilityFilter.js";
import { ACCESS_LEVELS } from "../../utils/accessLevels.js";

const MANAGER_LEVEL = ACCESS_LEVELS['gerente'] ?? 5;

export async function createProgram(data: OcpType.CreateProgramPayload) {
    const result = await program(data);
    return result;
}

export async function createSession(input: OcpType.CreateSessionInput) {
    const result = await session(input);
    return result;
}

export async function updateProgram(programId: number, input: OcpType.UpdateProgramInput) {
    const parsed = updateProgramSchema.parse({ ...input, id: programId });
    const result = await programUpdate(programId, parsed);
    return result;
}

export async function getProgramById(programId: string) {
    return prisma.ocp.findUnique({
        where: { id: Number(programId) },
        select: {
            id: true,
            nome_programa: true,
            cliente_id: true,
            cliente: {
                select: {
                    nome: true,
                    cuidadores: {
                        select: {
                            nome: true,
                        },
                        take: 1,
                    },
                    dataNascimento: true,
                }
            },
            data_inicio: true,
            data_fim: true,
            terapeuta_id: true,
            terapeuta: {
                select: {
                    nome: true,
                }
            },
            criado_em: true,
            objetivo_programa: true,
            objetivo_descricao: true,
            descricao_aplicacao: true,
            objetivo_curto: true,
            estimulo_ocp: {
                select: {
                    id_estimulo: true,
                    nome: true,
                    status: true,
                    descricao: true,
                },
                orderBy: { id_estimulo: 'desc' }
            },
            criterio_aprendizagem: true,
            observacao_geral: true,
            desempenho_atual: true,
            status: true,
        }
    });
}

export async function getSessionsByProgram(programId: number, limit: number) {
    const sessions = await prisma.sessao.findMany({
        where: { ocp_id: programId },
        orderBy: { data_criacao: 'desc' },
        take: limit,
        include: {
            terapeuta: { select: { nome: true } },
            trials: { select: { resultado: true, ordem: true } },
        },
    });
    
    return sessions.map(OcpNormalizer.mapSessionReturn);
}

export async function getClientById(clientId: string) {
    const client = await prisma.cliente.findUnique({
        where: { id: clientId },
        include: {
            cuidadores: {
                take: 1,
                select: {
                    nome: true,
                },
            },
        },
    });

    if (!client) return null;

    const birthYear = client.dataNascimento!.getFullYear();
    const currentYear = new Date().getFullYear();

    return {
        id: client.id,
        name: client.nome,
        guardianName: client.cuidadores[0]?.nome ?? null,
        age: currentYear - birthYear,
        photoUrl: `/api/arquivos/getAvatar?ownerType=cliente&ownerId=${client.id}`,
    }
}

export async function getProgramId(programId: string) {
    const session = await prisma.sessao.findUnique({
        where: { id: Number(programId) },
        select: {
            ocp: {
                select: {
                    id: true,
                    nome_programa: true,
                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            cuidadores: {
                                select: {
                                    nome: true,
                                }
                            },
                            dataNascimento: true,
                        },
                    },
                    terapeuta: {
                        select: {
                            id: true,
                            nome: true
                        },
                    },
                    criado_em: true,
                    data_inicio: true,
                    data_fim: true,
                    objetivo_programa: true,
                    objetivo_descricao: true,
                    estimulo_ocp: {
                        select: {
                            id: true,
                            nome: true,
                            status: true,
                        },
                    },
                    status: true,
                }
            }
        }
    });
    if (!session?.ocp) return null;
    return OcpNormalizer.mapOcpProgramSession(session?.ocp);
}

export async function listClientsByTherapist(therapistId: string, q?: string) {
    const visibility = await getVisibilityScope(therapistId);
    if (visibility.scope === 'none') {
        return [];
    }

    const restrictStatus = visibility.maxAccessLevel < MANAGER_LEVEL;

    const where: Prisma.clienteWhereInput = {
        ...(visibility.scope === 'partial'
            ? {
                terapeuta: {
                    some: {
                        terapeuta_id: { in: visibility.therapistIds },
                        ...(restrictStatus ? { status: 'active' } : {}),
                    },
                },
            }
            : {}),
        ...(restrictStatus ? { status: 'ativo' } : {}),
        ...(q
            ? {
                OR: [
                    { nome: { contains: q } },
                    {
                        cuidadores: {
                            some: { nome: { contains: q } },
                        },
                    },
                ],
            }
            : {}),
    };

    return prisma.cliente.findMany({
        where,
        select: {
            id: true,
            nome: true,
            dataNascimento: true,
            cuidadores: {
                select: {
                    nome: true,
                },
                take: 1,
            },
        },
        orderBy: { nome: "asc" },
    });
}

export async function listByClientId(
    clientId: string, 
    page = 1,  pageSize = 10, 
    area: string,
    status: 'active' | 'archived' | 'all' = 'all', 
    q?: string,
    sort: 'recent' | 'alphabetic' = 'recent'
) {
    const translateStatus =
        status === 'active' ? 'ativado' :
        status === 'archived' ? 'arquivado' :
        undefined;

    // cria o objeto base
    const where: Prisma.ocpWhereInput = {
        cliente_id: clientId,
        area,
        ...(translateStatus && { status: translateStatus }), // só inclui se existir
    };

    // adiciona o filtro de busca se q existir
    if (q) {
        where.OR = [
            { nome_programa: { contains: q } },
            { objetivo_programa: { contains: q } },
            { objetivo_descricao: { contains: q } },
        ];
    }

    return await prisma.ocp.findMany({
        where,
        select: {
            id: true,
            cliente_id: true,
            nome_programa: true,
            objetivo_programa: true,
            objetivo_descricao: true,
            criterio_aprendizagem: true,
            observacao_geral: true,
            status: true,
            criado_em: true,
            atualizado_em: true,
        },
        orderBy: sort === 'alphabetic'
            ? { nome_programa: 'asc' }
            : { atualizado_em: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
}

type SessionSort = 'recent' | 'accuracy-asc' | 'accuracy-desc';

function calculateSessionIndependency(session: OcpType.SessionDTO) {
    const totalTrials = session.trials.length;
    if (!totalTrials) return null;

    const independentTrials = session.trials.filter(trial => trial.resultado === 'independent').length;
    return independentTrials / totalTrials;
}

export async function listSessionsByClient(clientId: string, sort: SessionSort = 'recent') {
    const sessions = await prisma.sessao.findMany({
        where: { cliente_id: clientId },
        select: {
            id: true,
            cliente_id: true,
            terapeuta_id: true,
            data_criacao: true,
            observacoes_sessao: true,
            ocp: {
                select: {
                    id: true,
                    nome_programa: true,
                    objetivo_programa: true,
                    criado_em: true,
                },
            },
            trials: {
                select: {
                    id: true,
                    ordem: true,
                    resultado: true,
                    estimulosOcp: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
                },
                orderBy: { ordem: 'asc' },
            },
        },
        orderBy: { data_criacao: 'desc' },
    });

    if (sort === 'recent') return sessions;

    const direction = sort === 'accuracy-asc' ? 'asc' : 'desc';

    return [...sessions].sort((a, b) => {
        const accuracyA = calculateSessionIndependency(a);
        const accuracyB = calculateSessionIndependency(b);

        if (accuracyA === null && accuracyB === null) {
            return b.data_criacao.getTime() - a.data_criacao.getTime();
        }

        if (accuracyA === null) return 1;
        if (accuracyB === null) return -1;

        if (accuracyA === accuracyB) {
            return b.data_criacao.getTime() - a.data_criacao.getTime();
        }

        return direction === 'asc'
            ? accuracyA - accuracyB
            : accuracyB - accuracyA;
    })
}

export async function getKpis(filtros: OcpType.KpisFilters) {
    const where: Prisma.sessaoWhereInput = {};
    if (filtros.pacienteId) where.cliente_id = filtros.pacienteId;
    if (filtros.programaId) where.ocp_id = Number(filtros.programaId);

    const stimulusId = filtros.estimuloId ? Number(filtros.estimuloId) : undefined;

    if (stimulusId) {
        where.trials = {
            some: {
                estimulosOcp: {
                    id: stimulusId,
                },
            },
        };
    }
    if (filtros.terapeutaId) where.terapeuta_id = filtros.terapeutaId;

    if (filtros.periodo.mode === "30d") {
        where.data_criacao = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }
    if (filtros.periodo.mode === "90d") {
        where.data_criacao = { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) };
    }
    if (filtros.periodo.mode === "custom" && filtros.periodo.start && filtros.periodo.end) {
        const startDate = parseISO(filtros.periodo.start);
        const endDate = parseISO(filtros.periodo.end);

        if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
            where.data_criacao = {
                gte: startOfDay(startDate),
                lte: endOfDay(endDate),
            };
        }
    }

    const sessions = await prisma.sessao.findMany({
        where,
        include: {
            trials: stimulusId
                ? {
                    where: { estimulos_ocp_id: stimulusId },
                }
                : true,
        },
    });

    const totalSessions = sessions.length;
    const allTrials = sessions.flatMap(s => s.trials);

    const totalAttempts = allTrials.length;
    const correctAnswers = allTrials.filter(t => t.resultado === "prompted").length;
    const independentAnswers = allTrials.filter(t => t.resultado === "independent").length;

    const accuracyPct = totalAttempts ? ((correctAnswers + independentAnswers) / totalAttempts) * 100 : 0;
    const independencyPct = totalAttempts ? (independentAnswers / totalAttempts) * 100 : 0;

    const cards = {
        acerto: Math.round(accuracyPct),
        independencia: Math.round(independencyPct),
        tentativas: totalAttempts,
        sessoes: totalSessions,
        gapIndependencia: Math.round(accuracyPct - independencyPct),
    };

    const graphic = sessions.map(s => {
        const totalAttempts = s.trials.length;
        const correctAnswers = s.trials.filter(t => t.resultado === "prompted").length;
        const independentAnswers = s.trials.filter(t => t.resultado === "independent").length;

        const accuracyPct = totalAttempts
            ? Math.round(((correctAnswers + independentAnswers) / totalAttempts) * 100)
            : 0;

        const independencyPct = totalAttempts
            ? Math.round((independentAnswers / totalAttempts) * 100)
            : 0;

        return {
            x: format(new Date(s.data_criacao), "dd/MM", { locale: ptBR }),
            acerto: accuracyPct,
            independencia: independencyPct,
        };
    });

    const ocpId = where.ocp_id;
    const register = await prisma.ocp.findMany({
        where: {
            ...(ocpId ? { id: Number(ocpId) } : {}),
        },
        select: {
            data_inicio: true,
            data_fim: true,
        }
    })
    
    let init: Date;
    let end: Date;

    if (ocpId) {
        init = register[0]!.data_inicio;
        end = register[0]!.data_fim;
    } else {
        init = new Date(Math.min(...register.map(r => r.data_inicio.getTime())));
        end = new Date(Math.max(...register.map(r => r.data_fim.getTime())));
    }

    const total = end.getTime() - init.getTime();
    const actual = Date.now() - init.getTime();
    const percent = total > 0 ? Math.min(100, Math.max(0, (actual / total) * 100)) : 0;
    const remainingDays = Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const label = `${remainingDays} dias restantes • ${Math.round(percent)}% do período decorrido`;

    const programDeadline = {
        percent: Math.round(percent),
        label,
        inicio: init.toISOString().split('T')[0],
        fim: end.toISOString().split('T')[0],
    };

    return {
        cards, graphic, programDeadline
    };
}

export async function getStimulusReport(clientId?: string, programId?: string) {
    const where: {
        ocp: {
            cliente_id?: string;
            id?: number;
        };
    } = {
        ocp: {},
    };

    if (clientId) {
        where.ocp.cliente_id = clientId;
    }

    if (programId) {
        where.ocp.id = Number(programId);
    }

    return prisma.estimulo_ocp.findMany({
        where,
        select: {
            id: true,
            nome: true,
        },
        orderBy: {
            nome: 'asc',
        },
    });
}

export async function getProgramsReport(clientId?: string) {
    const where = clientId ? { cliente_id: clientId } : {};
    
    const ocps = await prisma.ocp.findMany({
        where,
        select: {
            id: true,
            nome_programa: true,
        }
    })

    return ocps.map((o) => ({
        id: o.id,
        nome: o.nome_programa,
    }))
}

export async function getAttentionStimuli(filters: OcpType.AttentionStimuliFilters) {
    const where: Prisma.sessaoWhereInput = {
        cliente_id: filters.pacienteId,
    };

    if (filters.programaId) {
        where.ocp_id = Number(filters.programaId);
    }

    if (filters.terapeutaId) {
        where.terapeuta_id = filters.terapeutaId;
    }

    if (filters.periodo) {
        if (filters.periodo.mode === '30d') {
            where.data_criacao = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        } else if (filters.periodo.mode === '90d') {
            where.data_criacao = { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) };
        } else if (filters.periodo.mode === 'custom' && filters.periodo.start && filters.periodo.end) {
            const startDate = parseISO(filters.periodo.start);
            const endDate = parseISO(filters.periodo.end);

            if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
                where.data_criacao = {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate),
                };
            }
        }
    }

    const sessions = await prisma.sessao.findMany({
        where,
        orderBy: { data_criacao: 'desc' },
        take: filters.lastSessions,
        select: {
            id: true,
            trials: {
                select : {
                    resultado: true,
                    estimulos_ocp_id: true,
                    estimulosOcp: {
                        select: {
                            id: true,
                            id_estimulo: true,
                            nome: true,
                            estimulo: {
                                select: {
                                    id: true,
                                    nome: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    type AggregateEntry = {
        id: string;
        label: string;
        counts: { erro: number; ajuda: number; indep: number };
        total: number;
    };

    const aggregates = new Map<number, AggregateEntry>();

    for (const session of sessions) {
        for (const trial of session.trials) {
            if (!trial.estimulosOcp) continue;

            const stimulusId = trial.estimulos_ocp_id;
            const current = aggregates.get(stimulusId);

            const label = trial.estimulosOcp.nome
                ?? trial.estimulosOcp.estimulo?.nome
                ?? `Estímulo ${stimulusId}`;
            
            const entry = current ?? {
                id: String(trial.estimulosOcp.id),
                label,
                counts: { erro: 0, ajuda: 0, indep: 0 },
                total: 0,
            };

            if (current && current.label === `Estímulo ${stimulusId}` && label !== current.label) {
                current.label = label;
            }

            entry.total += 1;

            if (trial.resultado === 'error') {
                entry.counts.erro += 1;
            } else if (trial.resultado === 'prompted') {
                entry.counts.ajuda += 1;
            } else if (trial.resultado === 'independent') {
                entry.counts.indep += 1;
            }

            aggregates.set(stimulusId, entry);
        }
    }

    let hasSufficientData = false;

    const items = Array.from(aggregates.values()).map<OcpType.AttentionStimulusItem>((entry) => {
        const independence = entry.total > 0
            ? Math.round((entry.counts.indep / entry.total) * 100)
            : 0;
        
        let status: OcpType.AttentionStimulusItem['status'];
        if (entry.total < 5) {
            status = 'insuficiente';
        } else if (independence <= 60) {
            status = 'atencao';
        } else if (independence <= 80) {
            status = 'mediano';
        } else {
            status = 'positivo';
        }

        if (entry.total >= 5) {
            hasSufficientData = true;
        }

        return {
            id: entry.id,
            label: entry.label,
            counts: { ...entry.counts },
            total: entry.total,
            independence,
            status,
        };
    });

    const attentionItems = items
        .filter((item) => item.status === 'atencao')
        .sort((a, b) => a.independence - b.independence);
    
    return {
        items: attentionItems,
        total: attentionItems.length,
        hasSufficientData,
    };
}