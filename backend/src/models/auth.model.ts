import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/hash.util.js'

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

export async function loginUserByAccessInformation(accessInfo: string, table: 'terapeuta') {
    let field: string;  
    accessInfo.includes('@') ? field = 'email' : field = 'cpf';

    const user = await prisma[table].findFirst({
        where: {
            [field]: accessInfo,
        },
        select: {
            senha: true,
        }
    });

    return user;
}

export async function newPassword(token: string, password: string, table: 'terapeuta') {
    const result = await prisma[table].updateMany({
        where: {
            token_redefinicao: token
        },
        data: {
            senha: await hashPassword(password),
            token_redefinicao: null,
            validade_token: null
        }
    });

    return result;
}