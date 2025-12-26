import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database.js';
import { AppError } from '../../../errors/AppError.js';
import * as LinkTypes from './links.types.js';
import * as list from './actions/list.js';
import * as clients from './actions/clients.js';

const LINK_SELECT = {
    id: true,
    terapeuta_id: true,
    cliente_id: true,
    papel: true,
    status: true,
    data_inicio: true,
    data_fim: true,
    observacoes: true,
    area_atuacao: true,
    criado_em: true,
    atualizado_em: true,
} as const;

async function resolveTherapistActuation(
    therapistId: string,
    actuation: string | null | undefined,
) {
    const normalizedActuation = actuation?.trim();

    if (!normalizedActuation) {
        throw new AppError(
            'LINK_ACTUATION_REQUIRED',
            'A área de atuação é obrigatória para o terapeuta selecionado.',
            400,
        );
    }

    const parsedId = Number(normalizedActuation);
    const isNumericActuation = !Number.isNaN(parsedId) && `${parsedId}` === normalizedActuation;

    const registration = await prisma.registro_profissional.findFirst({
        where: {
            terapeuta_id: therapistId,
            ...(isNumericActuation
                ? { area_atuacao_id: parsedId }
                : {
                      area_atuacao: {
                          is: {
                              nome: {
                                  equals: normalizedActuation,
                              },
                          },
                      },
                  }),
        },
        select: {
            area_atuacao: {
                select: {
                    nome: true,
                },
            },
        },
    });

    if (!registration) {
        const therapistExists = await prisma.terapeuta.findUnique({
            where: { id: therapistId },
            select: { id: true },
        });

        if (!therapistExists) {
            throw new AppError('LINK_THERAPIST_NOT_FOUND', 'Terapeuta não encontrado.', 404);
        }

        throw new AppError(
            'LINK_INVALID_ACTUATION',
            'a área de atuação informada não está cadastrada para o terapeuta selecionado.',
            400,
        );
    }

    return registration.area_atuacao.nome;
}

/**
 * Service responsável por criar um novo vínculo entre cliente e terapeuta.
 * Resolve a área de atuação conforme o terapeuta informado e persiste o vínculo no banco.
 * Em caso de sucesso, retorna o vínculo recém-criado com os campos definidos em LINK_SELECT.
 * Não realiza normalização — responsabilidade da camada Controller.
 */
export async function createLink(payload: LinkTypes.CreateLink) {
    const actuationArea = await resolveTherapistActuation(
        payload.therapistId,
        payload.actuationArea,
    );

    if (payload.endDate && payload.startDate < payload.endDate) {
        throw new AppError(
            'DATE_RANGE_INVALID',
            'A data de término não pode ser anterior à data de início.',
            400,
        );
    }

    const existingLink = await prisma.terapeuta_cliente.findFirst({
        where: {
            cliente_id: payload.patientId,
            terapeuta_id: payload.therapistId,
        },
    });

    if (existingLink) {
        throw new AppError(
            'LINK_ALREADY_EXISTS',
            'Já existe um vínculo ativo entre o terapeuta e o cliente.',
            400,
        );
    }

    const created = await prisma.terapeuta_cliente.create({
        data: {
            cliente_id: payload.patientId,
            terapeuta_id: payload.therapistId,
            papel: payload.role,
            status: 'active',
            data_inicio: new Date(payload.startDate),
            data_fim: payload.endDate ? new Date(payload.endDate) : null,
            observacoes: payload.notes ?? null,
            area_atuacao: actuationArea,
        },
        select: LINK_SELECT,
    });

    return created;
}

export async function getClientOptions(userId: string, search?: string, limit?: number) {
    const clientOptions = await clients.findClientOptions(userId, search, limit);
    return clientOptions;
}

export async function listClients(
    userId: string,
    search?: string,
    includeResponsavel?: boolean,
    limit?: number,
) {
    const clientList = await clients.findClientList(userId, search, includeResponsavel, limit);
    return clientList;
}

export async function getAllTherapists(userId: string, search?: string, _role?: string) {
    const therapists = await list.getAllTherapists(userId, search);
    return therapists;
}

export async function getAllLinks(userId: string, filters?: LinkTypes.LinkFilters) {
    const links = await list.getAllLinks(userId, filters);
    return links;
}

export async function updateLink(payload: LinkTypes.UpdateLink) {
    const linkId = Number(payload.id);

    if (Number.isNaN(linkId)) {
        throw new AppError('LINK_INVALID_ID', 'Identificador do vínculo inválido.', 400);
    }

    const existing = await prisma.terapeuta_cliente.findUnique({
        where: { id: linkId },
        select: LINK_SELECT,
    });

    if (!existing) {
        throw new AppError('LINK_NOT_FOUND', 'Vínculo não encontrado.', 404);
    }

    const data: Prisma.terapeuta_clienteUpdateInput = {};

    if (payload.startDate) {
        const parsedStart = new Date(payload.startDate);

        if (Number.isNaN(parsedStart.getTime())) {
            throw new AppError('LINK_INVALID_START_DATE', 'Data de início inválida.', 400);
        }

        data.data_inicio = parsedStart;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'notes')) {
        data.observacoes = payload.notes ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'actuationArea')) {
        const requested = payload.actuationArea;
        if (!requested?.trim()) {
            throw new AppError('LINK_ACTUATION_REQUIRED', 'A área de atuação é obrigatória.', 400);
        }

        data.area_atuacao = await resolveTherapistActuation(existing.terapeuta_id, requested);
    } else if (!existing.area_atuacao) {
        throw new AppError('LINK_ACTUATION_REQUIRED', 'A área de atuação é obrigatória.', 400);
    }

    // Tratamento para reativação: endDate = null e status = 'active'
    if (Object.prototype.hasOwnProperty.call(payload, 'endDate')) {
        if (payload.endDate === null) {
            // Reativar vínculo
            data.data_fim = null;
            data.status = 'active';
        } else if (payload.endDate) {
            const parsedEnd = new Date(payload.endDate);
            if (Number.isNaN(parsedEnd.getTime())) {
                throw new AppError('LINK_INVALID_END_DATE', 'Data de término inválida.', 400);
            }
            data.data_fim = parsedEnd;
        }
    }

    // Tratamento do status
    if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
        data.status = payload.status as 'active' | 'ended' | 'archived';
    }

    if (Object.keys(data).length === 0) return existing;

    const updated = await prisma.terapeuta_cliente.update({
        where: { id: linkId },
        data,
        select: LINK_SELECT,
    });

    return updated;
}

/**
 * Service responsável por reabrir um vínculo encerrado ou arquivado entre cliente e terapeuta.
 * Apenas vínculos com status='ended' ou status='archived' podem ser reativados.
 * Ao reabrir, o status é alterado para 'active' e a data de término (data_fim) é limpa.
 * Em caso de erro (vínculo inexistente ou status inválido), lança um AppError apropriado.
 */
export async function reopenLink(id: number) {
    const linkId = id;

    const existing = await prisma.terapeuta_cliente.findUnique({
        where: { id: linkId },
        select: LINK_SELECT,
    });

    if (!existing) {
        throw new AppError('LINK_NOT_FOUND', 'Vínculo não encontrado.', 404);
    }

    if (existing.status !== 'ended' && existing.status !== 'archived') {
        throw new AppError(
            'LINK_NOT_ENDED_OR_ARCHIVED',
            'Apenas vínculos encerrados ou arquivados podem ser reabertos.',
            400,
        );
    }

    const updated = await prisma.terapeuta_cliente.update({
        where: { id: linkId },
        data: {
            status: 'active',
            data_fim: null,
        },
        select: LINK_SELECT,
    });

    return updated;
}

/**
 * Service responsável por arquivar um vínculo entre cliente e terapeuta.
 * Apenas vínculos com status='ended' podem ser arquivados.
 * Em caso de violação, lança um AppError com código e mensagem adequados.
 */
export async function archiveLink(payload: LinkTypes.ArchiveLink) {
    const linkId = Number(payload.id);

    if (Number.isNaN(linkId)) {
        throw new AppError('LINK_INVALID_ID', 'Identificador do vínculo inválido.', 400);
    }

    const existing = await prisma.terapeuta_cliente.findUnique({
        where: { id: linkId },
        select: LINK_SELECT,
    });

    if (!existing) {
        throw new AppError('LINK_NOT_FOUND', 'Vínculo não encontrado.', 404);
    }

    // Verificação de estado: só permite arquivar se o vínculo estiver encerrado
    if (existing.status !== 'ended') {
        throw new AppError(
            'LINK_NOT_ENDED',
            'Apenas vínculos encerrados podem ser arquivados.',
            400,
        );
    }

    const updated = await prisma.terapeuta_cliente.update({
        where: { id: linkId },
        data: {
            status: 'archived',
        },
        select: LINK_SELECT,
    });

    return updated;
}

export async function endLink(payload: LinkTypes.EndLink) {
    const linkId = Number(payload.id);

    if (Number.isNaN(linkId)) {
        throw new AppError('LINK_INVALID_ID', 'Identificador do vínculo inválido.', 400);
    }

    const endDate = new Date(payload.endDate);

    if (Number.isNaN(endDate.getDate())) {
        throw new AppError('LINK_INVALID_END_DATE', 'Data de encerramento inválida.', 400);
    }

    const existing = await prisma.terapeuta_cliente.findUnique({
        where: { id: linkId },
        select: LINK_SELECT,
    });

    if (!existing) {
        throw new AppError('LINK_NOT_FOUND', 'Vínculo não encontrado.', 404);
    }

    if (endDate < existing.data_inicio) {
        throw new AppError(
            'LINK_INVALID_END_DATE',
            'A data de encerramento não pode ser anterior à data de início do vínculo.',
            400,
        );
    }

    const updated = await prisma.terapeuta_cliente.update({
        where: { id: linkId },
        data: {
            data_fim: endDate,
            status: 'ended',
        },
        select: LINK_SELECT,
    });

    return updated;
}

export async function transferResponsible(
    payload: LinkTypes.TransferResponsible,
): Promise<LinkTypes.TransferResponsibleResult> {
    if (payload.fromTherapistId === payload.toTherapistId) {
        throw new AppError(
            'LINK_TRANSFER_SAME_THERAPIST',
            'O novo responsável precisa ser diferente do responsável atual.',
            400,
        );
    }

    const effectiveDate = new Date(payload.effectiveDate);

    if (Number.isNaN(effectiveDate.getTime())) {
        throw new AppError(
            'LINK_INVALID_EFFECTIVE_DATE',
            'Data de efetivação da transferência inválida.',
            400,
        );
    }

    const currentResponsible = await prisma.terapeuta_cliente.findFirst({
        where: {
            cliente_id: payload.patientId,
            terapeuta_id: payload.fromTherapistId,
            papel: 'responsible',
            status: 'active',
        },
        select: LINK_SELECT,
    });

    if (!currentResponsible) {
        throw new AppError(
            'LINK_RESPONSIBLE_NOT_FOUND',
            'Responsável atual não encontrado para o cliente informado.',
            404,
        );
    }

    const [newResponsibleArea, previousResponsibleArea] = await Promise.all([
        resolveTherapistActuation(payload.toTherapistId, payload.newResponsibleActuation),
        resolveTherapistActuation(payload.fromTherapistId, payload.oldResponsibleActuation),
    ]);

    const transferResult = await prisma.$transaction(async (trx) => {
        const existingNewTherapistLink = await trx.terapeuta_cliente.findFirst({
            where: {
                cliente_id: payload.patientId,
                terapeuta_id: payload.toTherapistId,
                status: 'active',
            },
            select: LINK_SELECT,
            orderBy: { atualizado_em: 'desc' },
        });

        if (existingNewTherapistLink?.papel === 'responsible') {
            throw new AppError(
                'LINK_RESPONSIBLE_EXISTS',
                'Já existe um responsável principal ativo para este cliente.',
                409,
            );
        }

        let newResponsible: LinkTypes.DBLink;

        if (existingNewTherapistLink) {
            newResponsible = await trx.terapeuta_cliente.update({
                where: { id: existingNewTherapistLink.id },
                data: {
                    papel: 'responsible',
                    status: 'active',
                    data_fim: null,
                    area_atuacao: newResponsibleArea,
                    atualizado_em: effectiveDate,
                },
                select: LINK_SELECT,
            });
        } else {
            newResponsible = await trx.terapeuta_cliente.create({
                data: {
                    cliente_id: payload.patientId,
                    terapeuta_id: payload.toTherapistId,
                    papel: 'responsible',
                    status: 'active',
                    data_inicio: effectiveDate,
                    data_fim: null,
                    observacoes: `Transferido de ${payload.fromTherapistId} em ${payload.effectiveDate}`,
                    area_atuacao: newResponsibleArea,
                },
                select: LINK_SELECT,
            });
        }

        const previousResponsible = await trx.terapeuta_cliente.update({
            where: { id: currentResponsible.id },
            data: {
                papel: 'co',
                area_atuacao: previousResponsibleArea,
                atualizado_em: effectiveDate,
            },
            select: LINK_SELECT,
        });

        return {
            previousResponsible,
            newResponsible,
        } satisfies LinkTypes.TransferResponsibleResult;
    });

    return transferResult;
}
