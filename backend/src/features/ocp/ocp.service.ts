import { prisma } from "../../config/database.js";
import type { createOCP } from "./ocp.types.js";

export async function create(data: createOCP) {
    return prisma.ocp.create({
        data: {
            cliente: { connect: { id: data.clientId } },
            criador: { connect: { id: data.therapistId } },
            nome_programa: data.name ?? data.goalTitle,
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
        },
    });
    
    return sessions.map(s => ({
        id: s.id.toString(),
        date: s.data_criacao.toISOString(),
        therapistName: s.terapeuta?.nome,
        overallScore: null,
        independenceRate: null,
        preview: [],
    }))
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

export function mapClientReturn(dto: Awaited<ReturnType<typeof listClientsByTherapist>>[number]) {
    const guardianName = dto.cliente_responsavel?.[0]?.responsaveis?.nome ?? null;
    return {
        id: dto.id,
        name: dto.nome,
        birthDate: dto.data_nascimento,
        guardianName,
    };
}

export function mapOcpReturn(dto: Awaited<ReturnType<typeof listByClientId>>[number]) {
    return {
        id: dto.id.toString(),
        title: dto.nome_programa,
        objective: dto.objetivo_programa,
        status: dto.status as 'active' | 'archived',
        lastSession: dto.atualizado_em.toISOString(),
        patiendId: dto.cliente_id,
    };
}