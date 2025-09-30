import { prisma } from "../../config/database.js";

export async function getCardsOverview() {
    const [totalTherapists, totalClients, newTherapists, newClients, activeTherapists, activeClients] = await Promise.all([
        prisma.terapeuta.count(),
        prisma.cliente.count(),
        prisma.terapeuta.count({
            where: { data_entrada: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
        }),
        prisma.cliente.count({
            where: { dataEntrada: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
        }),
        prisma.terapeuta.count({
            where: { atividade: true }
        }),
        prisma.cliente.count({
            where: { status: 'ativo' }
        })
    ]);

    return { totalTherapists, totalClients, newTherapists, newClients, activeTherapists, activeClients };
}