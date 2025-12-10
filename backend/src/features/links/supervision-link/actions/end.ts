import { prisma } from '../../../../config/database.js';
import { normalizeSupervisionLink } from '../normalizers/supervisionLinkNormalizer.js';
import type { EndSupervisionLinkInput } from '../types/supervisionLink.types.js';

/**
 * Encerra um vínculo de supervisão existente.
 * Define data_fim e altera o status para 'encerrado'.
 */
export async function endSupervisionLink(data: EndSupervisionLinkInput) {
    if (!data.endDate || isNaN(Date.parse(data.endDate))) {
        throw new Error('Data de término inválida.');
    }

    const link = await prisma.vinculo_supervisao.findUnique({
        where: { id: data.id },
    });

    if (!link) {
        throw new Error('Vínculo de supervisão não encontrado.');
    }

    // --- NOVA REGRA: impedir reencerramento ---
    if (link.status === 'encerrado' || link.status === 'arquivado') {
        throw new Error('O vínculo já está encerrado ou arquivado.');
    }

    const endDate = new Date(data.endDate);

    // --- Validação: data_fim não pode ser anterior a data_inicio ---
    if (endDate < link.data_inicio) {
        throw new Error('A data de término não pode ser anterior à data de início do vínculo.');
    }

    const updated = await prisma.vinculo_supervisao.update({
        where: { id: data.id },
        data: {
            data_fim: endDate,
            status: 'encerrado',
        },
    });

    return normalizeSupervisionLink(updated);
}
