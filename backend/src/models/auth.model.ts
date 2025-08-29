import { prisma } from '../config/database.js';

export async function findUserByResetToken(token: string, table: 'terapeuta') {
    const user = await prisma[table].findFirst({
        where: {
            token_redefinicao: token,
            validade_token: {
                gte: new Date(),
            },
        },
        select: {
            nome: true,
            email: true,
        },
    });

    return user;
}
