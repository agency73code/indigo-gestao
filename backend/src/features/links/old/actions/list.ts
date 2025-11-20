import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/database.js";
import type { LinkFilters } from "../links.types.js";
import { getVisibilityScope } from "../../../../utils/visibilityFilter.js";
import { ACCESS_LEVELS } from "../../../../utils/accessLevels.js";

const MANAGER_LEVEL = ACCESS_LEVELS['gerente'] ?? 5;

export async function getAllClients(userId: string, search?: string) {
    const whereBase: Prisma.clienteWhereInput = {};

    // Filtro de nome (busca por texto)
    if (search && search.trim() !== '') {
        whereBase.nome = { contains: search.trim().toLowerCase() }
    }

    const visibility = await getVisibilityScope(userId);

    if (visibility.scope === 'none') {
        return [];
    }

    const extraFilters: Prisma.clienteWhereInput[] = [];

    if (visibility.scope === 'partial') {
        extraFilters.push({
            terapeuta: {
                some: {
                    terapeuta_id: { in: visibility.therapistIds },
                    ...(visibility.maxAccessLevel < MANAGER_LEVEL
                        ? { status: 'active' }
                        : {}),
                },
            },
        });
    }

    if (visibility.maxAccessLevel < MANAGER_LEVEL) {
        extraFilters.push({ status: 'ativo' });
    }

    const finalWhere: Prisma.clienteWhereInput =
        extraFilters.length > 0
            ? { AND: [whereBase, ...extraFilters] }
            : whereBase;

    return prisma.cliente.findMany({
        where: finalWhere,
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

export async function getAllTherapists(userId: string, search?: string, _role?: string) {
    const whereBase: Prisma.terapeutaWhereInput = {};

    // Filtro de nome (busca por texto)
    if (search && search.trim() !== '') {
        whereBase.nome = { contains: search.trim().toLowerCase() }
    }

    const visibility = await getVisibilityScope(userId);

    if (visibility.scope === 'none') {
        return [];
    }

    const extraFilters: Prisma.terapeutaWhereInput[] = [];

    if (visibility.scope === 'partial') {
        extraFilters.push({
            OR: [
                { id: { in: visibility.therapistIds } },
                {
                    supervisionados: {
                        some: { clinico_id: { in: visibility.therapistIds } },
                    },
                },
            ],
        });
    }

    if (visibility.maxAccessLevel < MANAGER_LEVEL) {
        extraFilters.push({ atividade: true });
    }

    const finalWhere: Prisma.terapeutaWhereInput =
        extraFilters.length > 0
        ? { AND: [whereBase, ...extraFilters] }
        : whereBase;

    const therapists = await prisma.terapeuta.findMany({
        where: finalWhere,
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
                    area_atuacao_id: true,
                    cargo_id: true,
                    area_atuacao: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
                    cargo: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
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
    return therapists;
}

export async function getAllLinks(userId: string, filters?: LinkFilters) {
    const whereBase = buildWhere(filters);
    const orderBy = buildOrderBy(filters);

    const visibility = await getVisibilityScope(userId);

    if (visibility.scope === 'none') {
        return [];
    }

    const extraFilters: Prisma.terapeuta_clienteWhereInput[] = [];

    if (visibility.scope === 'partial') {
        extraFilters.push({ terapeuta_id: { in: visibility.therapistIds } });
    }

    if (visibility.maxAccessLevel < MANAGER_LEVEL) {
        extraFilters.push({ status: 'active' });
    }

    const finalWhere =
        extraFilters.length > 0
        ? { AND: [whereBase, ...extraFilters] }
        : whereBase;

    const links = await prisma.terapeuta_cliente.findMany({
        where: finalWhere,
        take: 10,
        orderBy,
        include: {
            terapeuta: {
                include: {
                    registro_profissional: {
                        include: { area_atuacao: true },
                    },
                },
            },
            cliente: {
                include: {
                    cuidadores: true,
                },
            },
        },
    });

    return links;
}

/**
 * Monta dinamicamente o objeto "where" com base nos filtros recebidos.
 */
function buildWhere(filters?: LinkFilters) {
    if (!filters) return {};

    const { status, q } = filters;

    const where: Record<string, unknown> = {};

    // Filtro de status
    if (status && status !== 'all') {
        where.status = translateStatusFilter(status);
    }

    // Filtro de busca textual
    if (q && q.trim() !== '') {
        where.OR = [
            // Terapeuta
            { terapeuta: { nome: { contains: q } } },
            { terapeuta: { email: { contains: q } } },
            { terapeuta: { email_indigo: { contains: q } } },
            { terapeuta: { cpf: { contains: q } } },
            {
                terapeuta: {
                    registro_profissional: {
                        some: {
                            area_atuacao: { nome: { contains: q } },
                        },
                    },
                },
            },

            // Cliente
            { cliente: { nome: { contains: q } } },
            { cliente: { emailContato: { contains: q } } },
            { cliente: { cpf: { contains: q } } },

            // Cuidador do cliente
            { cliente: { cuidadores: { some: { nome: { contains: q } } } } },
            { cliente: { cuidadores: { some: { email: { contains: q } } } } },
            { cliente: { cuidadores: { some: { cpf: { contains: q } } } } },
        ];
    }

    return where;
}

/**
 * Define a ordenação conforme o filtro `orderBy` recebido.
 */
function buildOrderBy(filters?: LinkFilters) {
    const recent = filters?.orderBy === 'recent';
    return { atualizado_em: recent ? 'desc' : 'asc' } as const;
}

/**
 * Converte o status do frontend (en-US) para o formato do banco (pt-BR).
 */
function translateStatusFilter(status: LinkFilters['status']) {
    switch (status) {
        case 'active':
            return 'ativo';
        case 'ended':
            return 'encerrado';
        case 'archived':
            return 'arquivado';
        default:
            return undefined;
    }
}