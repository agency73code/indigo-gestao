import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';
import * as OcpType from './types/olp.types.js';
import * as OcpNormalizer from './olp.normalizer.js';
import { endOfDay, format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { musictherapySession, physiotherapySession, program, SpeechSession, TOSession } from './actions/create.js';
import { programMusicUpdate, programUpdate } from './actions/update.js';
import { updateProgramSchema } from './types/olp.schema.js';
import { getVisibilityScope } from '../../utils/visibilityFilter.js';
import { ACCESS_LEVELS } from '../../utils/accessLevels.js';

const MANAGER_LEVEL = ACCESS_LEVELS['gerente'] ?? 5;
const DAY = 1000 * 60 * 60 * 24;
const DAYS = (n: number) => n * DAY;

export async function createProgram(data: OcpType.CreateProgramPayload) {
    return await program(data);
}

export async function createSpeechSession(input: OcpType.CreateSpeechSessionInput) {
    return await SpeechSession(input);
}

export async function createTOSession(input: OcpType.CreateToSessionInput) {
    return await TOSession(input);
}

export async function createPhysiotherapySession(input: OcpType.CreatePhysiotherapySessionInput) {
    return await physiotherapySession(input);
}

export async function createMusictherapySession(input: OcpType.CreateMusictherapySessionInput) {
    return await musictherapySession(input);
}

export async function updateProgram(programId: number, input: OcpType.UpdateProgramInput) {
    const parsed = updateProgramSchema.parse({ ...input, id: programId });
    const result = await programUpdate(programId, parsed);
    return result;
}

export async function updateMusicProgram(programId: number, input: OcpType.UpdateMusicProgramInput) {
    return await programMusicUpdate(programId, input);
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
                },
            },
            data_inicio: true,
            data_fim: true,
            terapeuta_id: true,
            terapeuta: {
                select: {
                    nome: true,
                },
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
                    metodos: true,
                    tecnicas_procedimentos: true,
                },
                orderBy: { id_estimulo: 'desc' },
            },
            criterio_aprendizagem: true,
            observacao_geral: true,
            desempenho_atual: true,
            status: true,
        },
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
        photoUrl: null,
    };
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
                                },
                            },
                            dataNascimento: true,
                        },
                    },
                    terapeuta: {
                        select: {
                            id: true,
                            nome: true,
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
                            descricao: true,
                            status: true,
                            metodos: true,
                            tecnicas_procedimentos: true,
                        },
                    },
                    status: true,
                },
            },
        },
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
        orderBy: { nome: 'asc' },
    });
}

export async function listProgramsByClientId(
    clientId: string,
    userId: string,
    page = 1,
    pageSize = 10,
    area: string,
    status: 'all' | 'active' | 'archived',
    q?: string,
    sort: 'recent' | 'alphabetic' = 'recent',
) {
    const translateResult = status === 'all' ? null : status === 'active' ? 'ativado' : 'arquivado';

    // cria o objeto base
    const where: Prisma.ocpWhereInput = {
        cliente_id: clientId,
        terapeuta_id: userId,
        area,
        ...(translateResult && { status: translateResult }), // só inclui se existir
    };

    // adiciona o filtro de busca se q existir
    if (q) {
        where.OR = [
            { nome_programa: { contains: q } },
            { objetivo_programa: { contains: q } },
            { objetivo_descricao: { contains: q } },
        ];
    }
    
    const result = await prisma.ocp.findMany({
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
        orderBy: sort === 'alphabetic' ? { nome_programa: 'asc' } : { atualizado_em: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });

    return result;
}

export async function listSessionsByClient(filters: OcpType.ListSessionsFilters) {
    const {
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
    } = filters;
    console.log(area)
    const where: Prisma.sessaoWhereInput = {};
    const order = sort === 'date-asc' ? 'asc' : 'desc';

    if (clientId) where.cliente_id = clientId;
    if (area) where.area = area;
    if (therapistId) where.terapeuta_id = therapistId;
    if (programId) where.ocp_id = Number(programId);

    if (stimulusId) {
        where.trials = {
            some: {
                estimulosOcp: {
                    id: Number(stimulusId),
                },
            },
        };
    }

    if (periodMode === 'all') {
        // Nenhum filtro de data
    } else if (periodMode === 'last7') {
        where.data_criacao = { gte: new Date(Date.now() - DAYS(7)) }
    } else if (periodMode === '30d' || periodMode === 'last30') {
        where.data_criacao = { gte: new Date(Date.now() - DAYS(30)) };
    } else if (periodMode === '90d') {
        where.data_criacao = { gte: new Date(Date.now() - DAYS(90)) };
    } else if (periodMode === 'year') {
        where.data_criacao = { gte: new Date(Date.now() - DAYS(365)) };
    } else if (periodMode === 'custom' && periodStart && periodEnd) {
        const startDate = parseISO(periodStart);
        const endDate = parseISO(periodEnd);

        if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
            where.data_criacao = {
                gte: startOfDay(startDate),
                lte: endOfDay(endDate),
            };
        }
    }

    if (q) {
        where.OR = [
            { ocp: { objetivo_programa: { contains: q } } },
            { ocp: { nome_programa: { contains: q } } },
            { terapeuta: { nome: { contains: q } } },
        ];
    }

    const [sessions, total] = await Promise.all([
        prisma.sessao.findMany({
            where,
            select: {
                id: true,
                cliente_id: true,
                terapeuta_id: true,
                data_criacao: true,
                observacoes_sessao: true,
                area: true,
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
                        duracao_minutos: true,
                        teve_desconforto: true,
                        descricao_desconforto: true,
                        teve_compensacao: true,
                        descricao_compensacao: true,
                        utilizou_carga: true,
                        valor_carga: true,
                        participacao: true,
                        suporte: true,
                        estimulosOcp: {
                            select: {
                                id: true,
                                id_estimulo: true,
                                nome: true,
                            },
                        },
                    },
                    orderBy: { ordem: 'asc' },
                },
                arquivos: {
                    select: {
                        id: true,
                        nome: true,
                        caminho: true,
                        tamanho: true,
                    },
                },
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { data_criacao: order },
        }),
        prisma.sessao.count({ where }),   
    ]);

    if (stimulusId) {
        sessions.forEach((session) => {
            session.trials = session.trials.filter(
                (t) => t.estimulosOcp.id === Number(stimulusId),
            );
        });
    }

    const sortedSessions =
        sort === 'date-asc' || sort === 'date-desc'
            ? sessions
            : [...sessions].sort((a, b) => {
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

                return sort === 'accuracy-asc'
                    ? accuracyA - accuracyB 
                    : accuracyB - accuracyA;
            });

    return {
        items: sortedSessions,
        total,
    }
}

export async function getKpis(filtros: OcpType.KpisFilters) {
    // ---------------------------------------
    // 1. Construção dos filtros (where)
    // ---------------------------------------
    const where: Prisma.sessaoWhereInput = {
        ...(filtros.pacienteId && { cliente_id: filtros.pacienteId }),
        ...(filtros.terapeutaId && { terapeuta_id: filtros.terapeutaId }),
        ...(filtros.programaId && { ocp_id: Number(filtros.programaId) }),
        ...(filtros.area && { area: filtros.area }),
    };

    const stimulusId = filtros.estimuloId ? Number(filtros.estimuloId) : undefined;

    if (stimulusId) {
        where.trials = { some: { estimulosOcp: { id_estimulo: stimulusId } } };
    }

    // Períodos
    const { mode, start, end } = filtros.periodo;
    if (mode === '30d') {
        where.data_criacao = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    } else if (mode === '90d') {
        where.data_criacao = { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) };
    } else if (mode === 'custom' && start && end) {
        const s = parseISO(start);
        const e = parseISO(end);

        if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
            where.data_criacao = {
                gte: startOfDay(s),
                lte: endOfDay(e),
            };
        }
    }

    // ---------------------------------------
    // 2. Consulta ao banco
    // ---------------------------------------
    const sessions = await prisma.sessao.findMany({
        where,
        include: {
            trials: stimulusId ? { where: { estimulosOcp: { id_estimulo: stimulusId } } } : true,
        },
    });

    const totalSessions = sessions.length;
    const allTrials = sessions.flatMap((s) => s.trials);

    // ---------------------------------------
    // 3. Funções auxiliares internas
    // ---------------------------------------
    const calcPct = (value: number, total: number) => 
        total ? Math.round((value / total) * 100) : 0;

    const count = (arr: typeof allTrials, type: 'prompted' | 'independent' | 'error') =>
        arr.filter((t) => t.resultado === type).length;

    // ---------------------------------------
    // 4. KPI GLOBAL
    // ---------------------------------------
    const totalAttempts = allTrials.length;

    const prompted = count(allTrials, 'prompted');
    const independent = count(allTrials, 'independent');

    const accuracyPct = calcPct(prompted + independent, totalAttempts);
    const independencePct = calcPct(independent, totalAttempts);

    const cards = {
        acerto: accuracyPct,
        independencia: independencePct,
        tentativas: totalAttempts,
        sessoes: totalSessions,
        gapIndependencia: accuracyPct - independencePct,
    };

    // ---------------------------------------
    // 5. Dados para gráfico
    // ---------------------------------------
    const graphic = sessions.map((s) => {
        const total = s.trials.length;

        const prompted = count(s.trials, 'prompted');
        const independent = count(s.trials, 'independent');
        const error = count(s.trials, 'error');

        return {
            x: format(new Date(s.data_criacao), 'dd/MM', { locale: ptBR }),
            acerto: calcPct(prompted + independent, total),
            ajuda: calcPct(prompted, total),
            independencia: calcPct(independent, total),
            erro: calcPct(error, total),
        };
    });

    // ---------------------------------------
    // 6. Deadline do programa
    // ---------------------------------------
    const programId = where.ocp_id;
    const program = await prisma.ocp.findMany({
        where: programId ? { id: Number(programId) } : {},
        select: { data_inicio: true, data_fim: true },
    });

    const periodStart = programId
        ? program[0]!.data_inicio
        : new Date(Math.min(...program.map((p) => p.data_inicio.getTime())));

    const periodEnd = programId
        ? program[0]!.data_fim
        : new Date(Math.max(...program.map((p) => p.data_fim.getTime())));

    const total = periodEnd.getTime() - periodStart.getTime();
    const elapsed = Date.now() - periodStart.getTime();

    const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const remainingDays = Math.max(
        0,
        Math.ceil((periodEnd.getTime() - Date.now()) / DAY),
    );

    const programDeadline = {
        percent: Math.round(percent),
        label: `${remainingDays} dias restantes • ${Math.round(percent)}% do período decorrido`,
        inicio: periodStart.toISOString().split('T')[0],
        fim: periodEnd.toISOString().split('T')[0],
    };

    // ---------------------------------------
    // 7. Retorno final
    // ---------------------------------------
    return {
        cards,
        graphic,
        programDeadline,
    };
}

export async function getStimulusReport(
    clientId?: string,
    programId?: string,
    area?: string,
    therapistId?: string,
) {
    const where: {
        ocp: {
            cliente_id?: string;
            id?: number;
            area?: string;
            terapeuta_id?: string;
        };
    } = {
        ocp: {},
    };

    if (clientId) where.ocp.cliente_id = clientId;
    if (programId) where.ocp.id = Number(programId);
    if (area) where.ocp.area = area;
    if (therapistId) where.ocp.terapeuta_id = therapistId;

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

export async function getProgramsReport(
    clientId?: string,
    area?: string,
    stimulusId?: string,
    therapistId?: string,
) {
    const where: Prisma.ocpWhereInput = {};

    if (clientId) where.cliente_id = clientId;
    if (area) where.area = area;
    if (stimulusId) {
        where.estimulo_ocp = {
            some: {
                id: Number(stimulusId),
            },
        };
    }
    if (therapistId) where.terapeuta_id = therapistId;

    const ocps = await prisma.ocp.findMany({
        where,
        select: {
            id: true,
            nome_programa: true,
        },
    });

    return ocps.map((o) => ({
        id: o.id,
        nome: o.nome_programa,
    }));
}

export async function getAttentionStimuli({
    clientId,
    lastSessions = 5,
    area,
    programId,
    therapistId,
    periodMode = '30d',
    periodStart,
    periodEnd,
}: {
    clientId: string;
    lastSessions: 1 | 3 | 5;
    area: string;
    programId?: number | undefined;
    therapistId?: string | undefined;
    periodMode?: '30d' | '90d' | 'custom' | undefined;
    periodStart?: string | undefined;
    periodEnd?: string | undefined;
}) {
    const where: Prisma.sessaoWhereInput = {
        cliente_id: clientId,
    };

    if (area) where.area = area;
    if (programId) where.ocp_id = programId;
    if (therapistId) where.terapeuta_id = therapistId;

    if (periodMode) {
        if (periodMode === '30d') {
            where.data_criacao = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        } else if (periodMode === '90d') {
            where.data_criacao = { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) };
        } else if (periodMode === 'custom' && periodStart && periodEnd) {
            const startDate = parseISO(periodStart);
            const endDate = parseISO(periodEnd);

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
        take: lastSessions,
        select: {
            id: true,
            trials: {
                select: {
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

            const label =
                trial.estimulosOcp.nome ??
                trial.estimulosOcp.estimulo?.nome ??
                `Estímulo ${stimulusId}`;

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
        const independence =
            entry.total > 0 ? Math.round((entry.counts.indep / entry.total) * 100) : 0;

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

function calculateSessionIndependency(session: OcpType.SessionDTO) {
    const totalTrials = session.trials.length;
    if (!totalTrials) return null;

    const independentTrials = session.trials.filter(
        (trial) => trial.resultado === 'independent',
    ).length;
    return independentTrials / totalTrials;
}
