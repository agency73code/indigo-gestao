import type { Request, Response } from "express";
import { archiveSupervisionLinkService, createSupervisionLinkService, endSupervisionLinkService, getAllSupervisionLinksService, UpdateSupervisionLinkService } from "./supervisionLink.service.js";
import { LinkFiltersSchema } from "./types/supervisionLinkFilters.schema.js";

/**
 * Controller responsável por criar um vínculo de supervisão.
 * Recebe a requisição, repassa ao service e retorna a resposta normalizada.
 */
export async function createSupervisionLinkController(req: Request, res: Response): Promise<Response> {
    try {
        const result = await createSupervisionLinkService(req.body);
        return res.status(201).json(result);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Erro desconhecido ao criar vínculo de supervisão.';
        return res.status(400).json({ message });
    }
}

/**
 * Controller responsável por listar os vínculos de supervisão.
 * Recebe a requisição HTTP, chama o service correspondente e retorna a resposta normalizada.
 * Em caso de falha, envia uma mensagem de erro adequada ao frontend.
 */
export async function getAllSupervisionLinksController(req: Request, res: Response): Promise<Response> {
    try {
        const filters = LinkFiltersSchema.parse(req.body);

        const result = await getAllSupervisionLinksService(req.user!.id, filters);

        return res.status(200).json(result);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Erro desconhecido ao listar vínculos de supervisão.';
        return res.status(400).json({ message });
    }
}

/**
 * Controller responsável por atualizar um vínculo de supervisão existente.
 * Recebe a requisição HTTP, repassa o payload ao service e retorna a resposta normalizada.
 * Em caso de erro, envia mensagem apropriada ao frontend.
 */
export async function UpdateSupervisionLinkController(req: Request, res: Response): Promise<Response> {
    try {
        const result = await UpdateSupervisionLinkService(req.body);
        return res.status(200).json(result);
    } catch (error) {
        const message = 
            error instanceof Error
                ? error.message
                : 'Erro desconhecido ao atualizar vínculo de supervisão.';
            return res.status(400).json({ message });
    }
}

/**
 * Controller responsável por encerrar um vínculo de supervisão existente.
 * Recebe o payload { id, endDate }, encaminha ao service e retorna o vínculo encerrado.
 */
export async function endSupervisionLinkController(req: Request, res: Response): Promise<Response> {
    try {
        const result = await endSupervisionLinkService(req.body);
        return res.status(200).json(result);
    } catch (error) {
        const message = 
            error instanceof Error
                ? error.message
                : 'Erro desconhecido ao encerrar vínculo de supervisão.';
        return res.status(400).json({ message });
    }
}

/**
 * Controller responsável por arquivar um vínculo de supervisão existente.
 * Repassa o ID ao service e retorna o vínculo atualizado.
 */
export async function archiveSupervisionLinkController(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: "O campo 'id' é obrigatório para arquivar um vínculo." })
        }

        const result = await archiveSupervisionLinkService(Number(id));
        return res.status(200).json(result);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Erro desconhecido ao arquivar vínculo de supervisão.';
        return res.status(400).json({ message });
    }
}