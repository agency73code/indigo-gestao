import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import * as LinkTypes from './links.types.js';

const LINK_SELECT = {
    id: true,
    terapeuta_id: true,
    cliente_id: true,
    papel: true,
    status: true,
    data_inicio: true,
    data_fim: true,
    observacoes: true,
    atuacao_coterapeuta: true,
    criado_em: true,
    atualizado_em: true,
} as const;

export async function createLink(payload: LinkTypes.CreateLink) {
    if (payload.role === 'responsible') {
        const existingResponsible = await prisma.terapeuta_cliente.findFirst({
            where: {
                cliente_id: payload.patientId,
                papel: 'responsible',
                status: 'active',
            },
        });

        if (existingResponsible) {
            throw new AppError('LINK_RESPONSIBLE_EXISTS', 'Já existe um responsável principal ativo para este cliente.', 409);
        }
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
            atuacao_coterapeuta: payload.coTherapistActuation ?? null,
        },
        select: LINK_SELECT,
    });

    return created;
}

export async function getAllClients() {
    return prisma.cliente.findMany({
        select: {
            id: true,
            nome: true,
            emailContato: true,
            dataNascimento: true,
            cpf: true,
            status: true,
            cuidadores: {
                select: {
                    nome: true,
                    telefone: true,
                    email: true,
                    relacao: true,
                    descricaoRelacao: true,
                },
                orderBy: { id: 'asc' },
            },
            enderecos: {
                select: {
                    residenciaDe: true,
                    outroResidencia: true,
                    endereco: {
                        select: {
                            cep: true,
                            rua: true,
                            numero: true,
                            bairro: true,
                            cidade: true,
                            uf: true,
                            complemento: true,
                        },
                    },
                },
                orderBy: { id: 'asc' },
            },
        },
        orderBy: { nome: 'asc' },
    });
}

export async function getAllTherapists() {
    return prisma.terapeuta.findMany({
        select: {
            id: true,
            nome: true,
            email: true,
            email_indigo: true,
            telefone: true,
            celular: true,
            cpf: true,
            data_nascimento: true,
            possui_veiculo: true,
            placa_veiculo: true,
            modelo_veiculo: true,
            banco: true,
            agencia: true,
            conta: true,
            chave_pix: true,
            valor_hora: true,
            professor_uni: true,
            data_entrada: true,
            data_saida: true,
            atividade: true,
            endereco: {
                select: {
                    cep: true,
                    rua: true,
                    numero: true,
                    bairro: true,
                    cidade: true,
                    uf: true,
                    complemento: true,
                },
            },
            registro_profissional: {
                select: {
                    area_atuacao: true,
                    cargo: true,
                    numero_conselho: true,
                },
            },
            formacao: {
                select: {
                    graduacao: true,
                    instituicao_graduacao: true,
                    ano_formatura: true,
                    participacao_congressos: true,
                    publicacoes_descricao: true,
                    pos_graduacao: {
                        select: {
                            tipo: true,
                            curso: true,
                            instituicao: true,
                            conclusao: true,
                        },
                    },
                },
            },
            pessoa_juridica: {
                select: {
                    cnpj: true,
                    razao_social: true,
                    endereco: {
                        select: {
                            cep: true,
                            rua: true,
                            numero: true,
                            bairro: true,
                            cidade: true,
                            uf: true,
                            complemento: true,
                        },
                    },
                },
            },
        },
        orderBy: { nome: 'asc' },
    });
}

export async function getAllLinks() {
    return prisma.terapeuta_cliente.findMany({
        select: LINK_SELECT,
        orderBy: { atualizado_em: 'desc' },
    });
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
        throw new AppError('LINK_NOT_FOUND', 'Vínculo não encontrado.', 404)
    }
    
    const nextRole = payload.role ?? existing.papel;
    const nextStatus = payload.status ?? existing.status;
    
    if (nextRole === 'responsible' && nextStatus === 'active') {
        const otherResponsible = await prisma.terapeuta_cliente.findFirst({
            where: {
                cliente_id: existing.cliente_id,
                papel: 'responsible',
                status: 'active',
                NOT: { id: linkId },
            },
            select: { id: true },
        });

        if (otherResponsible) {
            throw new AppError(
                'LINK_RESPONSIBLE_EXISTS',
                'Já existe um responsável principal ativo para este cliente.',
                409,
            );
        }
    }

    const data: Prisma.terapeuta_clienteUpdateInput = {};

    let startDate = existing.data_inicio;
    if (payload.startDate) {
        const parsedStart = new Date(payload.startDate);

        if (Number.isNaN(parsedStart.getTime())) {
            throw new AppError('LINK_INVALID_START_DATE', 'Data de início inválida.', 400);
        }

        data.data_inicio = parsedStart;
        startDate = parsedStart;
    }

    let endDate = existing.data_fim;
    const hasEndDate = Object.prototype.hasOwnProperty.call(payload, 'endDate');

    if (hasEndDate) {
        if (payload.endDate === null) {
            data.data_fim = null;
            endDate = null;
        } else if (typeof payload.endDate === 'string' && payload.endDate.trim() !== '') {
            const parsedEnd = new Date(payload.endDate);

            if (Number.isNaN(parsedEnd.getTime())) {
                throw new AppError('LINK_INVALID_END_DATE', 'Data de término inválida.', 400);
            }

            data.data_fim = parsedEnd;
            endDate = parsedEnd;
        } else if (typeof payload.endDate === 'string') {
            data.data_fim = null;
            endDate = null;
        }
    }

    if (endDate && endDate < startDate) {
        throw new AppError(
            'LINK_INVALID_END_DATE',
            'A data de encerramento não pode ser anterior à data de início do vínculo.',
            400,
        );
    }

    const roleChangedToResponsible = payload.role === 'responsible' && existing.papel !== 'responsible';

    if (payload.role) {
        data.papel = payload.role;
    }

    if (payload.status) {
        data.status = payload.status;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'notes')) {
        data.observacoes = payload.notes ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'coTherapistActuation')) {
        data.atuacao_coterapeuta = payload.coTherapistActuation ?? null;
    } else if (roleChangedToResponsible) {
        data.atuacao_coterapeuta = null;
    }

    if (Object.keys(data).length === 0) {
        return existing;
    }

    const updated = await prisma.terapeuta_cliente.update({
        where: { id: linkId },
        data,
        select: LINK_SELECT,
    });

    return updated;
}

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

    if (existing.status === 'archived') {
        return existing;
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

export async function transferResponsible(payload: LinkTypes.TransferResponsible): Promise<LinkTypes.TransferResponsibleResult> {
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
                    atuacao_coterapeuta: null,
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
                    atuacao_coterapeuta: null,
                },
                select: LINK_SELECT,
            });
        }

        const previousResponsible = await trx.terapeuta_cliente.update({
            where: { id: currentResponsible.id },
            data: {
                papel: 'co',
                atuacao_coterapeuta: payload.oldResponsibleActuation,
                atualizado_em: effectiveDate,
            },
            select: LINK_SELECT,
        });

        return { previousResponsible, newResponsible } satisfies LinkTypes.TransferResponsibleResult;
    });

    return transferResult;
}