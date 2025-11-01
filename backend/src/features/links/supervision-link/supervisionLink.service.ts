import type { CreateSupervisionLinkInput, EndSupervisionLinkInput, LinkFilters, RawCreateSupervisionLinkInput, UpdateSupervisionLinkInput } from "./types/supervisionLink.types.js";
import { createSupervisionLink } from "./actions/create.js";
import { getAllSupervisionLinks } from "./actions/list.js";
import { updateSupervisionLink } from "./actions/update.js";
import { endSupervisionLink } from "./actions/end.js";
import { archiveSupervisionLink } from "./actions/archive.js";

/**
 * Service Responsável por orquestrar a criação de um vínculo de supervisão.
 * Recebe o payload do controller, valida tipos e encaminha ao action.
 */
export async function createSupervisionLinkService(
    payload: RawCreateSupervisionLinkInput
): Promise<ReturnType<typeof createSupervisionLink>> {
    if (!payload.supervisorId) {
        throw new Error('Supervisor não informado.');
    }

    if (!payload.supervisedTherapistId) {
        throw new Error('Clínico não informado.');
    }

    // Conversão e validação básica de tipos
    const data: CreateSupervisionLinkInput = {
        supervisorId: payload.supervisorId,
        supervisedTherapistId: payload.supervisedTherapistId,
        startDate: new Date(payload.startDate),
        endDate: payload.endDate ? new Date(payload.endDate) : null,
        hierarchyLevel: payload.hierarchyLevel ? Number(payload.hierarchyLevel) : 1,
        supervisionScope: payload.supervisionScope ?? 'direto',
        notes: payload.notes ?? null,
    };

    // Encaminha ao action
    const result = await createSupervisionLink(data);
    return result;
}

/**
 * Responsável por orquestrar a listagem de vínculos de supervisão.
 * Encaminha a requisição ao action responsável por buscar os dados.
 */
export async function getAllSupervisionLinksService(filters?: LinkFilters) {
    const result = await getAllSupervisionLinks(filters);
    return result;
}

/**
 * Responsável por orquestrar a atualização de um vínculo de supervisão.
 * Converte o payload recebido do controller e o encaminha para o action.
 */
export async function UpdateSupervisionLinkService(
    payload: UpdateSupervisionLinkInput
): Promise<ReturnType<typeof updateSupervisionLink>> {
    // Conversão mínima de tipos, garantindo consistência com o schema Prisma
    const data: UpdateSupervisionLinkInput = {
        id: payload.id,
        hierarchyLevel: payload.hierarchyLevel ? Number(payload.hierarchyLevel) : undefined,
        supervisionScope: payload.supervisionScope,
        startDate: payload.startDate ? new Date(payload.startDate).toISOString() : undefined,
        endDate: payload.endDate ? new Date(payload.endDate).toISOString() : null,
        notes: payload.notes ?? null,
        status: payload.status,
    };

    const result = await updateSupervisionLink(data);
    return result;
}

/**
 * Service responsável por orquestrar o encerramento de um vínculo de supervisão.
 * Converte o payload recebido do controller e encaminha ao action.
 */
export async function endSupervisionLinkService(
    payload: EndSupervisionLinkInput
): Promise<ReturnType<typeof endSupervisionLink>> {
    const data: EndSupervisionLinkInput = {
        id: payload.id,
        endDate: payload.endDate,
    };

    const result = await endSupervisionLink(data);
    return result;
}

/**
 * Service responsável por orquestrar o arquivamento de um vínculo de supervisão.
 * Recebe o ID do controller e encaminha ao action.
 */
export async function archiveSupervisionLinkService(id: number) {
    return await archiveSupervisionLink(id);
}