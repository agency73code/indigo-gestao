import { prisma } from '../../config/database.js';

export async function listProfessionalMetada() {
    const [areaAtuacao, cargos] = await Promise.all([
        prisma.area_atuacao.findMany({
            select: { id: true, nome: true },
            orderBy: { nome: 'asc' },
        }),
        prisma.cargo.findMany({
            select: { id: true, nome: true },
            orderBy: { nome: 'asc' },
        }),
    ]);

    return {
        areaAtuacao,
        cargos,
    };
}