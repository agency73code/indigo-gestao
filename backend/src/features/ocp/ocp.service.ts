import { prisma } from "../../config/database.js";

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
