import { prisma } from "../../config/database.js";
import { Prisma } from '@prisma/client'
import * as OcpType from "./ocp.types.js";
import * as OcpNormalizer from './ocp.normalizer.js';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function createProgram(data: OcpType.createOCP) {
    return prisma.ocp.create({
        data: {
            cliente: { connect: { id: data.clientId } },
            criador: { connect: { id: data.therapistId } },
            nome_programa: data.name ?? data.goalTitle,
            data_inicio: new Date(data.prazoInicio),
            data_fim: new Date (data.prazoFim),
            objetivo_programa: data.goalTitle,
            objetivo_descricao: data.goalDescription ?? null,
            dominio_criterio: data.criteria ?? null,
            observacao_geral: data.notes ?? null,
            estimulo_ocp: {
                create: data.stimuli.map((s) => ({
                    nome: s.label,
                    descricao: s.description ?? null,
                    status: s.active,
                    estimulo: {
                        connectOrCreate: {
                            where: { nome: s.label },
                            create: {
                                nome: s.label,
                                descricao: s.description ?? null
                            }
                        }
                    },
                })),
            },
        },
    });
}

export async function createSession(input: OcpType.CreateSessionInput) {
    const { programId, patientId, therapistId, attempts } = input;

    return await prisma.sessao.create({
        data: {
            ocp_id: programId,
            cliente_id: patientId,
            terapeuta_id: therapistId,
            data_criacao: new Date(),
            trials: {
                create: attempts.map((a) => ({
                    estimulos_ocp_id: parseInt(a.stimulusId, 10),
                    ordem: a.attemptNumber,
                    resultado: a.type,
                })),
            },
        },
        select: { id: true },
    });
}

export async function updateProgram(programId: number, input: OcpType.UpdateProgramInput) {
    await prisma.ocp.update({
        where: { id: programId },
        data: {
            ...(input.goalTitle !== undefined && { objetivo_programa: input.goalTitle }),
            ...(input.goalDescription !== undefined && { objetivo_descricao: input.goalDescription }),
            ...(input.criteria !== undefined && { dominio_criterio: input.criteria }),
            ...(input.notes !== undefined && { observacao_geral: input.notes }),
            ...(input.status !== undefined && { status: input.status }),
            ...(input.prazoInicio !== undefined && { data_inicio: new Date(input.prazoInicio) }),
            ...(input.prazoFim !== undefined && { data_fim: new Date(input.prazoFim) }),
        },
        include: { estimulo_ocp: true },
    });

    if (input.stimuli) {
        await Promise.all(
            input.stimuli.map(async (s) =>{
                if (s.id) {
                    return prisma.estimulo_ocp.update({
                        where: { id: Number(s.id) },
                        data: {
                            ...(s.label !== undefined && { nome: s.label }),
                            ...(s.description !== undefined && { descricao: s.description }),
                            ...(s.active !== undefined && { status: s.active }),
                        },
                    });
                } else {
                    const newStimuli = await prisma.estimulo.create({
                        data: {
                            nome: s.label,
                            descricao: s.description ?? null,
                        },
                    });

                    return prisma.estimulo_ocp.create({
                        data: {
                            id_estimulo: newStimuli.id,
                            id_ocp: programId,
                            nome: s.label,
                            descricao: s.description ?? null,
                            status : s.active ?? true,
                        },
                    });
                }
            })
        );
    }

    return prisma.ocp.findUnique({
        where: { id: programId },
        include: { estimulo_ocp: true },
    });
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
                    arquivos: {
                        where: {
                            tipo: 'fotoPerfil'
                        },
                        select: {
                            arquivo_id: true,
                        }
                    }
                }
            },
            criador_id: true,
            criador: {
                select: {
                    nome: true,
                }
            },
            criado_em: true,
            objetivo_programa: true,
            objetivo_descricao: true,
            estimulo_ocp: {
                select: {
                    id_estimulo: true,
                    nome: true,
                    descricao: true,
                    status: true,
                },
                orderBy: { id: 'asc' }
            },
            dominio_criterio: true,
            observacao_geral: true,
            status: true,
            data_fim: true,
            data_inicio: true,
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
            arquivos: {
                where: {
                    tipo: 'fotoPerfil',
                },
                select: { arquivo_id: true, }
            }
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
        photoUrl: client.arquivos[0]?.arquivo_id 
            ? `${process.env.API_URL}/api/arquivos/${client.arquivos[0].arquivo_id}/view/` 
            : null,
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
                    criador: {
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
                            descricao: true,
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
    return prisma.cliente.findMany({
        where: {
            terapeuta: { some: { terapeuta_id: therapistId } },
            ...(q
                ? {
                    OR: [
                        { nome: { contains: q } },
                        {
                            cuidadores: {
                                some: {
                                    nome: { contains: q },
                                },
                            },
                        },
                    ],
                }
            : {}),
        },
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
    status: 'active' | 'archived' | 'all' = 'all', 
    q?: string, 
    sort: 'recent' | 'alphabetic' = 'recent'
) {
    return await prisma.ocp.findMany({
        where: { 
            cliente_id: clientId,
            ...(status !== 'all' ? { status } : {}),
            ...(q
                ? {
                    OR: [
                        { nome_programa: { contains: q } },
                        { objetivo_programa: { contains: q } },
                        { objetivo_descricao: { contains: q } },
                    ],
                }
                : {}),
        },
        select: {
            id: true,
            cliente_id: true,
            nome_programa: true,
            objetivo_programa: true,
            objetivo_descricao: true,
            dominio_criterio: true,
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

export async function listSessionsByClient(clientId: string) {
    return prisma.sessao.findMany({
        where: { cliente_id: clientId },
        select: {
            id: true,
            cliente_id: true,
            terapeuta_id: true,
            data_criacao: true,
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
    });
}

export async function getKpis(filtros: OcpType.KpisFilters) {
  const where: Prisma.sessaoWhereInput = {};
    if (filtros.pacienteId) where.cliente_id = filtros.pacienteId;
    if (filtros.programaId) where.ocp_id = Number(filtros.programaId);
    if (filtros.estimuloId) {
        where.trials = {
            some: {
                estimulosOcp: {
                    estimulo: {
                        id: Number(filtros.estimuloId),
                    },
                },
            },
        };
    };
    if (filtros.terapeutaId) where.terapeuta_id = filtros.terapeutaId;

  if (filtros.periodo.mode === "30d") {
    where.data_criacao = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }
  if (filtros.periodo.mode === "90d") {
    where.data_criacao = { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) };
  }
  if (filtros.periodo.mode === "custom" && filtros.periodo.start && filtros.periodo.end) {
    where.data_criacao = {
      gte: new Date(filtros.periodo.start),
      lte: new Date(filtros.periodo.end),
    };
  }

  const sessions = await prisma.sessao.findMany({
    where,
    include: { trials: true },
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

export async function getStimulusReport() {
  return prisma.estimulo_ocp.findMany({
    select: {
      id: true,
      nome: true,
    }
  })
}

export async function getProgramsReport() {
  const ocps = await prisma.ocp.findMany({
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