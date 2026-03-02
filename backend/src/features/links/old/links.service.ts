import { Prisma } from '@prisma/client';
import { prisma } from '../../../config/database.js';
import { AppError } from '../../../errors/AppError.js';
import * as LinkTypes from './links.types.js';
import * as clients from './actions/clients.js';
import * as therapists from './actions/therapist.js';
import type { TherapistListQuery, TherapistSelectQuery } from '../../../schemas/queries/therapists.schema.js';
import { normalizeListTherapists, normalizeSelectTherapists } from './links.normalizer.js';
import type { linksPayload, linksUpdatePayload, transferResponsiblePayload } from '../links.schema.js';
import type { listLinksPayload } from '../schemas/listLinks.js';
import { ClienteTherapistLinkListSelect } from '../queries/ClienteTherapistLink.js';
import { getVisibilityScope } from '../../../utils/visibilityFilter.js';
import { mapLinkToDTO } from '../mappers/mapLinkToDTO.js';

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

/**
 * Service responsável por criar um novo vínculo entre cliente e terapeuta.
 * Resolve a área de atuação conforme o terapeuta informado e persiste o vínculo no banco.
 * Em caso de sucesso, retorna o vínculo recém-criado com os campos definidos em LINK_SELECT.
 * Não realiza normalização — responsabilidade da camada Controller.
 */
export async function createLink(payload: linksPayload) {
    try {
        return await prisma.$transaction(async (tx) => {
            const actuationArea = await tx.area_atuacao.findFirst({
                where: { nome: payload.actuationArea },
                select: { id: true }
            });
    
            if (!actuationArea) {
                throw new AppError(
                    'ACTUATION_AREA_NOT_FOUND',
                    'Área de atuação informada não existe.',
                    400,
                );
            }
    
            const created = await tx.terapeuta_cliente.create({
                data: {
                    cliente_id: payload.patientId,
                    terapeuta_id: payload.therapistId,
                    papel: payload.role,
                    status: 'active',
                    data_inicio: new Date(payload.startDate),
                    observacoes: payload.notes,
                    area_atuacao_id: actuationArea.id,
                    valor_cliente_sessao: payload.valorClienteSessao,
                    valor_sessao_consultorio: payload.valorSessaoConsultorio,
                    valor_sessao_homecare: payload.valorSessaoHomecare,
                    valor_hora_desenvolvimento_materiais: payload.valorHoraDesenvolvimentoMateriais,
                    valor_hora_supervisao_recebida: payload.valorHoraSupervisaoRecebida,
                    valor_hora_supervisao_dada: payload.valorHoraSupervisaoDada,
                    valor_hora_reuniao: payload.valorHoraReuniao,
                },
                select: ClienteTherapistLinkListSelect
            });
    
            return mapLinkToDTO(created);
        });
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002' &&
            err.meta?.modelName === 'terapeuta_cliente'
        ) {
            throw new AppError(
                'LINK_ALREADY_EXISTS',
                'Já existe vínculo entre este terapeuta e este cliente.',
                409,
            );
        }
        throw err;
    }
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

export async function selectTherapists(userId: string, query: TherapistSelectQuery) {
    const records = await therapists.selectTherapists(userId, query);
    return normalizeSelectTherapists(records);
}

export async function listTherapists(userId: string, query: TherapistListQuery) {
    const records = await therapists.listTherapists(userId, query);
    return normalizeListTherapists(records, query.includeNumeroConselho ?? false);
}

export async function getAllLinks(userId: string, filters: listLinksPayload) {
    const { q, status, orderBy, viewBy, page, pageSize } = filters
    const where: Prisma.terapeuta_clienteWhereInput = {
        ...(q && {
            OR: [
                { terapeuta: { nome: { contains: q } } },
                { cliente: { nome: { contains: q } } },
            ],
        }),
        ...(status !== 'all' && {
            status: { equals: status }
        }),
    };

    const visibility = await getVisibilityScope(userId);

    if (visibility.scope === 'none') {
        return [];
    }

    if (visibility.scope === 'partial') {
        where.terapeuta_id = { in: visibility.therapistIds };
    }

    let prismaOrder: Prisma.terapeuta_clienteOrderByWithRelationInput;

    if (orderBy === 'recent') {
        prismaOrder = { criado_em: 'desc' };
    } else if (viewBy === 'patient') {
        prismaOrder = { cliente: { nome: 'asc' } };
    } else {
        prismaOrder = { terapeuta: { nome: 'asc' } };
    }

    const links = await prisma.terapeuta_cliente.findMany({
        where,
        select: ClienteTherapistLinkListSelect,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: prismaOrder,
    });

    return links.map(mapLinkToDTO);
}

export async function updateLink(payload: linksUpdatePayload) {
    const updated = await prisma.$transaction(async (tx) => {
        const actuationArea = await tx.area_atuacao.findFirst({
            where: { nome: payload.actuationArea },
            select: { id: true }
        });

        if (!actuationArea) {
            throw new AppError(
                'ACTUATION_AREA_NOT_FOUND',
                'Área de atuação informada não existe.',
                400,
            );
        }

        return await tx.terapeuta_cliente.update({
            where: { id: payload.id },
            data: {
                papel: payload.role,
                data_inicio: payload.startDate,
                data_fim: payload.endDate,
                observacoes: payload.notes,
                area_atuacao_id: actuationArea.id,
                valor_cliente_sessao: payload.valorClienteSessao,
                valor_sessao_consultorio: payload.valorSessaoConsultorio,
                valor_sessao_homecare: payload.valorSessaoHomecare,
                valor_hora_desenvolvimento_materiais: payload.valorHoraDesenvolvimentoMateriais,
                valor_hora_supervisao_recebida: payload.valorHoraSupervisaoRecebida,
                valor_hora_supervisao_dada: payload.valorHoraSupervisaoDada,
                valor_hora_reuniao: payload.valorHoraReuniao,
            },
            select: ClienteTherapistLinkListSelect,
        });
    });

    return mapLinkToDTO(updated);
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

export async function transferResponsible(payload: transferResponsiblePayload) {
    if (payload.fromTherapistId === payload.toTherapistId) {
        throw new AppError(
            'LINK_TRANSFER_SAME_THERAPIST',
            'O novo responsável precisa ser diferente do responsável atual.',
            400,
        );
    }

    await prisma.$transaction(async (tx) => {
        const currentResponsible = await tx.terapeuta_cliente.findFirst({
            where: {
                cliente_id: payload.patientId,
                terapeuta_id: payload.fromTherapistId,
            },
            select: {
                id: true,
                terapeuta: {
                    select: {
                        nome: true,
                    }
                }
            },
        });
    
        if (!currentResponsible) {
            throw new AppError(
                'LINK_RESPONSIBLE_NOT_FOUND',
                'Responsável atual não encontrado para o cliente informado.',
                404,
            );
        }

        const actuationArea = await tx.area_atuacao.findFirst({
            where: { nome: payload.newResponsibleActuation },
            select: { id: true }
        });

        if (!actuationArea) {
            throw new AppError(
                'ACTUATION_AREA_NOT_FOUND',
                'Área de atuação informada não existe.',
                400,
            );
        }

        const toResponsible = await tx.terapeuta_cliente.findFirst({
            where: {
                cliente_id: payload.patientId,
                terapeuta_id: payload.toTherapistId,
            },
        })

        if (toResponsible) {
            throw new AppError(
                'LINK_ALREADY_EXISTS',
                'Já existe um vínculo entre este cliente e o terapeuta informado.',
                409,
            );
        }

        await tx.terapeuta_cliente.update({
            where: {
                id: currentResponsible.id,
                terapeuta_id: payload.fromTherapistId,
                cliente_id: payload.patientId,
            },
            data: {
                cliente_id: payload.patientId,
                terapeuta_id: payload.toTherapistId,
                papel: 'responsible',
                status: 'active',
                data_inicio: payload.effectiveDate,
                data_fim: null,
                observacoes: `Transferido de ${currentResponsible.terapeuta.nome} em ${payload.effectiveDate}`,
                area_atuacao_id: actuationArea.id,
            },
        });
    });

    return;
}
