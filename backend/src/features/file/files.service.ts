import { prisma } from '../../config/database.js';

export async function getAvatar(id: string, type: 'therapist' | 'client') {
    const where = type ==='therapist' ? { terapeutaId: id } : { clienteId: id };

    const file = await prisma.arquivos.findFirst({
        where: { ...where, tipo: 'fotoPerfil' },
        select: { arquivo_id: true },
    });

    if (!file?.arquivo_id) return null;

    return `${process.env.API_URL || ''}/api/arquivos/${file.arquivo_id}/view`;
}