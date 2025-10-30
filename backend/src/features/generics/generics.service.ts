import { prisma } from "../../config/database.js";

export async function getUserInfos(id: string) {
    const where = { id };

    const terapeuta = await prisma.terapeuta.findUnique({
        where,
        select: {
        nome: true,
        data_nascimento: true,
        },
    });

    if (terapeuta) return {
        tipo: "terapeuta",
        nome: terapeuta.nome,
        dataNascimento: terapeuta.data_nascimento, 
    };

    const cliente = await prisma.cliente.findUnique({
        where,
        select: {
        nome: true,
        dataNascimento: true,
        },
    });

    if (cliente) return {
        tipo: "cliente",
        nome: cliente.nome,
        dataNascimento: cliente.dataNascimento,
    };

    return null;
}