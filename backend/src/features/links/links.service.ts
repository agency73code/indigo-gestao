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
            throw new AppError('LINK_RESPONSIBLE_EXISTS', 'Já existe um responsável principal ativo para este paciente.', 409);
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