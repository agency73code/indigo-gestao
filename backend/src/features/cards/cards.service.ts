import { prisma } from "../../config/database.js";

export async function getCardsOverview() {
    const [totalTherapists, totalClients, newTherapist, newClients] = await Promise.all([
        prisma.terapeuta.count(),
        prisma.cliente.count(),
        prisma.terapeuta.count({
            where: { data_entrada: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
        }),
        prisma.cliente.count({
            where: { data_entrada: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
        }),
    ]);

    return { totalTherapists, totalClients, newTherapist, newClients };
}