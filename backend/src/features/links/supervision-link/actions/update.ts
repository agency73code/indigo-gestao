import { prisma } from "../../../../config/database.js";
import type { UpdateSupervisionLinkInput } from "../types/supervisionLink.types.js";
import { normalizeSupervisionLink } from "../normalizers/supervisionLinkNormalizer.js";

/**
 * Atualiza um vínculo de supervisão existente no banco.
 * Apenas campos permitidos são modificados; os demais permanecem inalterados.
 * Agora também permite reativar vínculos encerrados (endDate = null).
 */
export async function updateSupervisionLink(data: UpdateSupervisionLinkInput) {
    const link = await prisma.vinculo_supervisao.findUnique({
        where: { id: data.id },
    });

    if (!link) {
        throw new Error('Vínculo de supervisão não encontrado.');
    }

    // --- Validação: data_fim não pode ser anterior a data_inicio ---
    const startDateToCheck = data.startDate ? new Date(data.startDate) : link.data_inicio;
    if (data.endDate && new Date(data.endDate) < startDateToCheck) {
        throw new Error('A data de término não pode ser anterior à data de início.');
    }

    // --- Determinação do status final ---
    let finalStatus = link.status;

    // Caso o usuário envie endDate = null → reativar vínculo
    if (data.endDate === null) {
        finalStatus = 'ativo';
    }

    // Se veio um novo endDate e ele já passou ou é hoje, força status 'encerrado'
    else if (data.endDate && new Date(data.endDate) <= new Date()) {
        finalStatus = 'encerrado';
    }
    
    // Caso contrário, usa o status enviado, se houver
    else if (data.status) {
        finalStatus =
            data.status === 'active'
                ? 'ativo'
                : data.status === 'ended'
                ? 'encerrado'
                : data.status === 'archived'
                ? 'arquivado'
                : link.status;
    }

    const updated = await prisma.vinculo_supervisao.update({
        where: { id: data.id },
        data: {
            nivel_hierarquia: data.hierarchyLevel ?? link.nivel_hierarquia,
            escopo_supervisao: 
                data.supervisionScope === 'team'
                ? 'equipe'
                : data.supervisionScope === 'direct'
                ? 'direto'
                : link.escopo_supervisao,
            data_inicio: data.startDate ? new Date(data.startDate) : link.data_inicio,
            data_fim: 
                data.endDate == null
                    ? null
                    : new Date(data.endDate),
            observacoes: data.notes ?? link.observacoes,
            status: finalStatus,
        },
    });

    return normalizeSupervisionLink(updated);
}