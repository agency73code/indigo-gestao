import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/hash.util.js'

type Tables = 'terapeuta' | 'cliente';
type UserRow = {
    id: string | number;
    senha: string | null;
    nome: string;
    email: string | null;
}

export async function findUserByResetToken(token: string, table: Tables) {
    const where = {
        token_redefinicao: token,
        validade_token: { gte: new Date(), },
    };

    if (table === 'terapeuta') {
        return await prisma.terapeuta.findFirst({
            where,
            select: { nome: true, email: true, },
        });
    } else {
        return await prisma.cliente.findFirst({
            where,
            select: { nome: true, email_contato: true, },
        })
    }
}

export async function loginUserByAccessInformation(accessInfo: string, table: Tables): Promise<UserRow | null> {
    const isEmail = accessInfo.includes('@');
    const cpfOnlyDigits = accessInfo.replace(/\D/g, '');

    if (table === 'terapeuta') {
        const row = await prisma.terapeuta.findFirst({
            where: isEmail ? { email_indigo: accessInfo } : { cpf: cpfOnlyDigits },
            select: {
                id: true,
                senha: true,
                nome: true,
                email_indigo: true,
            }
        });

        if (!row) return null;
        return {
            id: row.id,
            senha: row.senha,
            nome: row.nome,
            email: row.email_indigo ?? null,
        };
    } else {
        const row = await prisma.cliente.findFirst({
            where: { email_contato: accessInfo }, // Falta adicionar a tabela responsavel para puxar por CPF
            select: {
                id: true,
                senha: true,
                nome: true,
                email_contato: true,
            }
        });

        if (!row) return null;
        return {
            id: row.id,
            senha: row.senha,
            nome: row.nome,
            email: row.email_contato ?? null,
        };
    }
}

export async function newPassword(token: string, password: string, table: Tables) {
    const where = { token_redefinicao: token, validade_token: { gte: new Date() } };
    const data = { 
                senha: await hashPassword(password),
                token_redefinicao: null,
                validade_token: null,
            };

    if (table === 'terapeuta') {
        return await prisma.terapeuta.updateMany({
            where,
            data,
        });
    } else {
        return await prisma.cliente.updateMany({
            where,
            data,
        });
    }
}