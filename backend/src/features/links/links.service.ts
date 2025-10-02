import { prisma } from '../../config/database.js'

export async function getAllClients() {
    // nome do cliente, data de nascimento, status
    return await prisma.cliente.findMany({
        select: {
            id: true,
            nome: true,
            dataNascimento: true
        },
    });
}