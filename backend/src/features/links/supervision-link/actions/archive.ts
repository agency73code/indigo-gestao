import { prisma } from '../../../../config/database.js';
import { normalizeSupervisionLink } from '../normalizers/supervisionLinkNormalizer.js';

/**
 * Arquiva um vínculo de supervisão existente (status='arquivado').
 * Não altera datas, apenas marca o vínculo como arquivado.
 */
export async function archiveSupervisionLink(id: number) {
    const link = await prisma.vinculo_supervisao.findUnique({
        where: { id },
    });

    if (!link) {
        throw new Error('Vínculo de supervisão não encontrado.');
    }

    if (link.status === 'ativo') {
        throw new Error('Não é possível arquivar um vínculo ainda ativo. Encerre-o antes.');
    }

    if (link.status === 'arquivado') {
        throw new Error('Este vínculo já está arquivado.');
    }

    const updated = await prisma.vinculo_supervisao.update({
        where: { id },
        data: { status: 'arquivado' },
    });

    return normalizeSupervisionLink(updated);
}
