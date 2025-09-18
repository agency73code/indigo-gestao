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

export async function listClientsByTherapist(therapistId: string) {
    return prisma.cliente.findMany({
        where: {
            terapeuta: { some: { terapeuta_id: therapistId } },
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

export function mapClientReturn(dto: Awaited<ReturnType<typeof listClientsByTherapist>>[number]) {
    const guardianName = dto.cliente_responsavel?.[0]?.responsaveis?.nome ?? null;
    return {
        id: dto.id,
        name: dto.nome,
        birthDate: dto.data_nascimento,
        guardianName,
    };
}
