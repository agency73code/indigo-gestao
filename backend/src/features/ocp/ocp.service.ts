import { prisma } from "../../config/database.js";
import type { createOCP } from "./ocp.normalizer.js";

export async function create(data: createOCP) {
    return prisma.ocp.create({
        data: {
            cliente: {
                connect: { id: data.clientId }
            },
            criador: {
                connect: { id: data.therapistId },
            },
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

export async function listByClientId(clientId: string, page = 1, pageSize = 10, status: 'active' | 'archived' | 'all' = 'all') {
    return prisma.ocp.findMany({
        where: { 
            cliente_id: clientId,
            ...(status !== 'all' ? { status: status === 'active' ? 'active' : 'archived' }
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
            criado_em: true,
            atualizado_em: true,
        },
        orderBy: { atualizado_em: 'desc' },
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
        status: 'active',
        lastSession: dto.atualizado_em.toISOString(),
        patiendId: dto.cliente_id,
    };
}