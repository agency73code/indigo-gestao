import { prisma } from "../../../../config/database.js";
import { normalizeSupervisionLink } from '../normalizers/supervisionLinkNormalizer.js';
import type { CreateSupervisionLinkInput } from "../types/supervisionLink.types.js";

/**
 * Cria um novo vínculo de supervisão no banco.
 */
export async function createSupervisionLink(data: CreateSupervisionLinkInput) {
    // Validações basicas
    if (data.supervisorId === data.supervisedTherapistId) {
        throw new Error('Um terapeuta não pode supervisionar a si mesmo.');
    }

    if (data.endDate && data.endDate < data.startDate) {
        throw new Error('A data de término não pode ser anterior à data de início.');
    }

    // Verificar atividades duplicadas
    const existingLink = await prisma.vinculo_supervisao.findFirst({
        where: {
            supervisor_id: data.supervisorId,
            clinico_id: data.supervisedTherapistId,
            status: 'active',
        },
    });

    if (existingLink) {
        throw new Error('Já existe um vínculo ativo entre este supervisor e este clínico nesta área.');
    }

    const newLink = await prisma.vinculo_supervisao.create({
        data: {
            supervisor_id: data.supervisorId,
            clinico_id: data.supervisedTherapistId,
            data_inicio: data.startDate,
            data_fim: data.endDate ?? null,
            nivel_hierarquia: data.hierarchyLevel ?? 1,
            escopo_supervisao: 
                data.supervisionScope === 'team'
                    ? 'equipe'
                    : 'direto',
            observacoes: data.notes ?? null,
        },
    });

    const normalized = normalizeSupervisionLink(newLink);
    return normalized;
}