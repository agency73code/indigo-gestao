import { prisma } from "../../config/database.js";
import * as OcpType from "./ocp.types.js";
import * as OcpNormalizer from './ocp.normalizer.js';

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
                    cliente_responsavel: {
                        select: {
                            prioridade: true,
                            responsaveis: { select: { nome: true, } }
                        },
                        orderBy: { prioridade: 'asc' },
                        take: 1
                    },
                    data_nascimento: true,

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
            cliente_responsavel: {
                take: 1,
                include: { responsaveis: true },
            },
        },
    });

    if (!client) return null;

    const birthYear = client.data_nascimento.getFullYear();
    const currentYear = new Date().getFullYear();

    return {
        id: client.id,
        name: client.nome,
        guardianName: client.cliente_responsavel[0]?.responsaveis?.nome ?? null,
        age: currentYear - birthYear,
        photoUrl: null,
    }
}

export async function getProgramId(programId: string) {
    const session = await prisma.ocp.findUnique({
        where: { id: Number(programId) },
        select: {
            id: true,
            nome_programa: true,
            cliente: {
                select: {
                    id: true,
                    nome: true,
                    cliente_responsavel: {
                        select: {
                            responsaveis: { select: { nome: true } },
                        },
                    },
                    data_nascimento: true,
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
    });

    if (!session) return null;
    return OcpNormalizer.mapOcpProgramSession(session);
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
                            cliente_responsavel: {
                                some: {
                                    responsaveis: { nome: { contains: q } },
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
            data_nascimento: true,
            cliente_responsavel: {
                select: {
                    prioridade: true,
                    responsaveis: { select: { nome: true } },
                },
                orderBy: { prioridade: "desc" },
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
    return prisma.ocp.findMany({
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
  const where: any = {};

  if (filtros.pacienteId) where.cliente_id = filtros.pacienteId;
  if (filtros.programaId) where.ocp_id = filtros.programaId;
  if (filtros.estimuloId) where.estimulo.id = filtros.estimuloId;
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

  // Exemplo de query
  return prisma.sessao.findMany({ where });
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