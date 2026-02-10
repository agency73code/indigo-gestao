import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError.js';
import * as ClientType from './client.types.js';
import { v4 as uuidv4 } from 'uuid';
import { getVisibilityScope } from '../../utils/visibilityFilter.js';
import { ACCESS_LEVELS } from '../../utils/accessLevels.js';
import type { clientUpdatePayload } from './client.schema.js';
import type { PrismaTransactionClient } from '../../types/prisma.types.js';
import { updateCaretakers, updateClientData, updatePaymentData, updateSchoolData } from './actions/clientUpdate.js';

const MANAGER_LEVEL = ACCESS_LEVELS['gerente'] ?? 5;

async function enderecoData(dto: ClientType.Client) {
    return dto.enderecos.map((e) => ({
        residenciaDe: e.residenciaDe ?? null,
        outroResidencia: e.outroResidencia ?? null,
        endereco: {
            connectOrCreate: {
                where: {
                    unique_endereco: {
                        cep: e.cep,
                        rua: e.logradouro,
                        numero: e.numero,
                        bairro: e.bairro,
                        cidade: e.cidade,
                        uf: e.uf,
                        complemento: e.complemento ?? '',
                    },
                } as Prisma.enderecoWhereUniqueInput,
                create: {
                    cep: e.cep ?? null,
                    rua: e.logradouro ?? null,
                    numero: e.numero ?? null,
                    bairro: e.bairro ?? null,
                    cidade: e.cidade ?? null,
                    uf: e.uf ?? null,
                    complemento: e.complemento ?? '',
                },
            },
        },
    }));
}

export async function create(dto: ClientType.Client) {
    const existsCpf = await prisma.cliente.findFirst({ where: { cpf: dto.cpf } });
    if (existsCpf) throw new AppError('CPF_DUPLICADO', 'CPF já cadastrado', 409);

    const existsEmail = await prisma.cliente.findUnique({
        where: { emailContato: dto.emailContato },
    });
    if (existsEmail) throw new AppError('EMAIL_DUPLICADO', 'E-mail já cadastrado', 409);

    const { token, expiry } = generateResetToken();
    const now = new Date();
    const dataSaida = dto.dataSaida ? new Date(dto.dataSaida) : null;

    const dtoStatus = !dataSaida || dataSaida > now ? 'ativo' : 'inativo';

    return await prisma.cliente.create({
        data: {
            nome: dto.nome,
            cpf: dto.cpf,
            dataNascimento: dto.dataNascimento,
            emailContato: dto.emailContato,
            dataEntrada: dto.dataEntrada,
            dataSaida: dto.dataSaida ? new Date(dto.dataSaida) : null,
            status: dtoStatus,
            perfil_acesso: 'user',
            senha: null,
            token_redefinicao: token,
            validade_token: expiry,

            cuidadores: {
                create: dto.cuidadores.map((c) => ({
                    relacao: c.relacao,
                    descricaoRelacao: c.descricaoRelacao ?? null,
                    nome: c.nome,
                    cpf: c.cpf,
                    profissao: c.profissao ?? null,
                    escolaridade: c.escolaridade ?? null,
                    telefone: c.telefone,
                    email: c.email,
                    dataNascimento: c.dataNascimento!,

                    endereco: {
                        connectOrCreate: {
                            where: {
                                unique_endereco: {
                                    cep: c.endereco.cep,
                                    rua: c.endereco.logradouro,
                                    numero: c.endereco.numero,
                                    bairro: c.endereco.bairro,
                                    cidade: c.endereco.cidade,
                                    uf: c.endereco.uf,
                                    complemento: c.endereco.complemento ?? '',
                                },
                            },
                            create: {
                                cep: c.endereco.cep,
                                rua: c.endereco.logradouro,
                                numero: c.endereco.numero,
                                bairro: c.endereco.bairro,
                                cidade: c.endereco.cidade,
                                uf: c.endereco.uf,
                                complemento: c.endereco.complemento ?? '',
                            },
                        },
                    },
                })),
            },

            enderecos: { create: await enderecoData(dto) },

            dadosPagamento: {
                create: {
                    nomeTitular: dto.dadosPagamento.nomeTitular,
                    numeroCarteirinha: dto.dadosPagamento.numeroCarteirinha,
                    telefone1: dto.dadosPagamento.telefone1,
                    telefone2: dto.dadosPagamento.telefone2 ?? null,
                    telefone3: dto.dadosPagamento.telefone3 ?? null,
                    email1: dto.dadosPagamento.email1,
                    email2: dto.dadosPagamento.email2 ?? null,
                    email3: dto.dadosPagamento.email3 ?? null,
                    sistemaPagamento: dto.dadosPagamento.sistemaPagamento,
                    prazoReembolso: dto.dadosPagamento.prazoReembolso ?? null,
                    numeroProcesso: dto.dadosPagamento.numeroProcesso ?? null,
                    nomeAdvogado: dto.dadosPagamento.nomeAdvogado ?? null,
                    telefoneAdvogado1: dto.dadosPagamento.telefoneAdvogado1 ?? null,
                    telefoneAdvogado2: dto.dadosPagamento.telefoneAdvogado2 ?? null,
                    telefoneAdvogado3: dto.dadosPagamento.telefoneAdvogado3 ?? null,
                    emailAdvogado1: dto.dadosPagamento.emailAdvogado1 ?? null,
                    emailAdvogado2: dto.dadosPagamento.emailAdvogado2 ?? null,
                    emailAdvogado3: dto.dadosPagamento.emailAdvogado3 ?? null,
                    houveNegociacao: dto.dadosPagamento.houveNegociacao ?? null,
                    valorAcordado: dto.dadosPagamento.valorAcordado ?? null,
                },
            },

            dadosEscola: {
                create: {
                    tipoEscola: dto.dadosEscola.tipoEscola,
                    nome: dto.dadosEscola.nome ?? null,
                    telefone: dto.dadosEscola.telefone ?? null,
                    email: dto.dadosEscola.email ?? null,
                    endereco: {
                        connectOrCreate: {
                            where: {
                                unique_endereco: {
                                    cep: dto.dadosEscola.endereco.cep ?? '',
                                    rua: dto.dadosEscola.endereco.logradouro ?? '',
                                    numero: dto.dadosEscola.endereco.numero ?? '',
                                    bairro: dto.dadosEscola.endereco.bairro ?? '',
                                    cidade: dto.dadosEscola.endereco.cidade ?? '',
                                    uf: dto.dadosEscola.endereco.uf ?? '',
                                    complemento: dto.dadosEscola.endereco.complemento ?? '',
                                },
                            },
                            create: {
                                cep: dto.dadosEscola.endereco.cep ?? '',
                                rua: dto.dadosEscola.endereco.logradouro ?? '',
                                numero: dto.dadosEscola.endereco.numero ?? '',
                                bairro: dto.dadosEscola.endereco.bairro ?? '',
                                cidade: dto.dadosEscola.endereco.cidade ?? '',
                                uf: dto.dadosEscola.endereco.uf ?? '',
                                complemento: dto.dadosEscola.endereco.complemento ?? '',
                            },
                        },
                    },

                    contatos: {
                        create: dto.dadosEscola.contatos.map((c) => ({
                            nome: c.nome,
                            telefone: c.telefone,
                            email: c.email,
                            funcao: c.funcao,
                        })),
                    },
                },
            },

            arquivos: {
                create:
                    dto.arquivos?.map((a) => ({
                        tipo: a.tipo,
                        arquivo_id: a.arquivo_id,
                        mime_type: a.mime_type,
                        tamanho: a.tamanho,
                        data_upload: new Date(a.data_upload),
                    })) ?? [],
            },
        },
        select: {
            id: true,
            emailContato: true,
            nome: true,
            token_redefinicao: true,
        },
    });
}

export async function getById(clientId: string) {
    return prisma.cliente.findUnique({
        where: {
            id: clientId,
        },
        select: {
            id: true,
            nome: true,
            cpf: true,
            dataNascimento: true,
            emailContato: true,
            dataEntrada: true,
            dataSaida: true,

            cuidadores: {
                select: {
                    id: true,
                    relacao: true,
                    descricaoRelacao: true,
                    nome: true,
                    cpf: true,
                    profissao: true,
                    escolaridade: true,
                    telefone: true,
                    email: true,
                    dataNascimento: true,
                    endereco: {
                        select: {
                            cep: true,
                            rua: true,
                            numero: true,
                            complemento: true,
                            bairro: true,
                            cidade: true,
                            uf: true,
                        },
                    },
                },
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
            },

            dadosPagamento: {
                select: {
                    nomeTitular: true,
                    numeroCarteirinha: true,

                    telefone1: true,
                    telefone2: true,
                    telefone3: true,

                    email1: true,
                    email2: true,
                    email3: true,

                    sistemaPagamento: true,
                    prazoReembolso: true,

                    numeroProcesso: true,
                    nomeAdvogado: true,
                    telefoneAdvogado1: true,
                    telefoneAdvogado2: true,
                    telefoneAdvogado3: true,
                    emailAdvogado1: true,
                    emailAdvogado2: true,
                    emailAdvogado3: true,

                    houveNegociacao: true,
                    valorAcordado: true,
                },
            },

            dadosEscola: {
                select: {
                    tipoEscola: true,
                    nome: true,
                    telefone: true,
                    email: true,

                    endereco: {
                        select: {
                            cep: true,
                            rua: true,
                            numero: true,
                            complemento: true,
                            bairro: true,
                            cidade: true,
                            uf: true,
                        },
                    },

                    contatos: {
                        select: {
                            nome: true,
                            telefone: true,
                            email: true,
                            funcao: true,
                        },
                    },
                },
            },

            arquivos: {
                select: {
                    tipo: true,
                    mime_type: true,
                    arquivo_id: true,
                    tamanho: true,
                    data_upload: true,
                },
            },
        },
    });
}

export async function update1(clientId: string, payload: clientUpdatePayload) {
    await prisma.$transaction(async (tx) => {
        const client = tx.cliente.findUnique({
            where: { id: clientId },
        });

        if (!client) {
            throw new AppError(
                'CLIENT_NOT_FOUND',
                'Cliente não encontrado.',
                404,
            );
        }

        const address = payload.enderecos[0];
        const addressClient = await tx.cliente_endereco.findFirst({
            where: { clienteId: clientId },
            select: { id: true },
        });
        
        if (!address) {
            throw new AppError(
                'CLIENT_ADDRESS_REQUIRED', 
                'Envie pelo menos um endereço.', 
                40
            );
        }

        if (!addressClient) {
            throw new AppError(
                'CLIENT_ADDRESS_NOT_FOUND', 
                'Cliente não possui endereço cadastrado.', 
                404
            );
        }

        await tx.cliente.update({
            where: { id: clientId },
            data: {
                nome: payload.nome,
                emailContato: payload.emailContato,
                cpf: payload.cpf,
                dataNascimento: payload.dataNascimento,
                dataEntrada: payload.dataEntrada,
                dataSaida: payload.dataSaida,

                enderecos: {
                    update: {
                        where: { id: addressClient.id },
                        data: {
                            residenciaDe: address.residenciaDe,
                            outroResidencia: address.outroResidencia,
                            endereco: {
                                update: {
                                    data: {
                                        cep: address.cep,
                                        rua: address.logradouro,
                                        numero: address.numero,
                                        bairro: address.bairro,
                                        cidade: address.cidade,
                                        uf: address.uf,
                                        complemento: address.complemento ?? '',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        for (const c of payload.cuidadores) {
            if (c.remove) {
                if (c.id !== undefined) {
                    await tx.cuidador.delete({ where: { id: c.id } });
                } else {
                    await tx.cuidador.delete({
                        where: { unique_cuidador: { clienteId: clientId, cpf: c.cpf } },
                    });
                }
                continue;
            }
            
            if (!c.id) {
                const data: Prisma.cuidadorCreateInput = {
                    cliente: { connect: { id: clientId } },
                    relacao: c.relacao,
                    descricaoRelacao: c.descricaoRelacao,
                    dataNascimento: c.dataNascimento,
                    nome: c.nome,
                    cpf: c.cpf,
                    profissao: c.profissao,
                    escolaridade: c.escolaridade,
                    telefone: c.telefone,
                    email: c.email,
                    endereco: {
                        create: {
                            cep: c.endereco.cep,
                            rua: c.endereco.logradouro,
                            numero: c.endereco.numero,
                            bairro: c.endereco.bairro,
                            cidade: c.endereco.cidade,
                            uf: c.endereco.uf,
                            complemento: c.endereco.complemento ?? '',
                        }
                    }
                };

                await tx.cuidador.create({ data });
            } else {
                await tx.cuidador.update({
                    where: { id: c.id, },
                    data: {
                        relacao: c.relacao,
                        descricaoRelacao: c.descricaoRelacao,
                        dataNascimento: c.dataNascimento,
                        nome: c.nome,
                        cpf: c.cpf,
                        profissao: c.profissao,
                        escolaridade: c.escolaridade,
                        telefone: c.telefone,
                        email: c.email,
                        endereco: {
                            upsert: {
                                create: {
                                    cep: c.endereco.cep ?? null,
                                    rua: c.endereco.logradouro ?? null,
                                    numero: c.endereco.numero ?? null,
                                    bairro: c.endereco.bairro ?? null,
                                    cidade: c.endereco.cidade ?? null,
                                    uf: c.endereco.uf ?? null,
                                    complemento: c.endereco.complemento ?? '',
                                },
                                update: {
                                    cep: c.endereco.cep ?? null,
                                    rua: c.endereco.logradouro ?? null,
                                    numero: c.endereco.numero ?? null,
                                    bairro: c.endereco.bairro ?? null,
                                    cidade: c.endereco.cidade ?? null,
                                    uf: c.endereco.uf ?? null,
                                    complemento: c.endereco.complemento ?? '',
                                },
                            },
                        },
                    },
                });
            }
        }

        await tx.dados_pagamento.update({
            where: { clienteId: clientId },
            data: {
                nomeTitular: payload.dadosPagamento.nomeTitular,
                numeroCarteirinha: payload.dadosPagamento.numeroCarteirinha,
                telefone1: payload.dadosPagamento.telefone1,
                telefone2: payload.dadosPagamento.telefone2,
                telefone3: payload.dadosPagamento.telefone3,
                email1: payload.dadosPagamento.email1,
                email2: payload.dadosPagamento.email2,
                email3: payload.dadosPagamento.email3,
                sistemaPagamento: payload.dadosPagamento.sistemaPagamento,
                prazoReembolso: payload.dadosPagamento.prazoReembolso,
                numeroProcesso: payload.dadosPagamento.numeroProcesso,
                nomeAdvogado: payload.dadosPagamento.nomeAdvogado,
                telefoneAdvogado1: payload.dadosPagamento.telefoneAdvogado1,
                telefoneAdvogado2: payload.dadosPagamento.telefoneAdvogado2,
                telefoneAdvogado3: payload.dadosPagamento.telefoneAdvogado3,
                emailAdvogado1: payload.dadosPagamento.emailAdvogado1,
                emailAdvogado2: payload.dadosPagamento.emailAdvogado2,
                emailAdvogado3: payload.dadosPagamento.emailAdvogado3,
                houveNegociacao: payload.dadosPagamento.houveNegociacao,
                valorAcordado: payload.dadosPagamento.valorAcordado,
            },
        });

        await tx.dados_escola.update({
            where: { clienteId: clientId },
            data: {
                tipoEscola: payload.dadosEscola.tipoEscola,
                nome: payload.dadosEscola.nome,
                telefone: payload.dadosEscola.telefone,
                email: payload.dadosEscola.email,
                endereco: {
                    upsert: {
                        create: {
                            cep: payload.dadosEscola.endereco.cep,
                            rua: payload.dadosEscola.endereco.logradouro,
                            numero: payload.dadosEscola.endereco.numero,
                            bairro: payload.dadosEscola.endereco.bairro,
                            cidade: payload.dadosEscola.endereco.cidade,
                            uf: payload.dadosEscola.endereco.uf,
                            complemento: payload.dadosEscola.endereco.complemento ?? '',
                        },
                        update: {
                            cep: payload.dadosEscola.endereco.cep,
                            rua: payload.dadosEscola.endereco.logradouro,
                            numero: payload.dadosEscola.endereco.numero,
                            bairro: payload.dadosEscola.endereco.bairro,
                            cidade: payload.dadosEscola.endereco.cidade,
                            uf: payload.dadosEscola.endereco.uf,
                            complemento: payload.dadosEscola.endereco.complemento ?? '',
                        },
                    },
                },
                contatos: {
                    deleteMany: {},
                    createMany: {
                        data: payload.dadosEscola.contatos.map((c) => ({
                            nome: c.nome,
                            telefone: c.telefone,
                            email: c.email,
                            funcao: c.funcao,
                        })),
                    },
                },
            },
        });
    });
}

export async function update(clientId: string, payload: clientUpdatePayload): Promise<void> {
    await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        const client = await tx.cliente.findUnique({
            where: { id: clientId },
        });

        if (!client) {
            throw new AppError(
                'CLIENT_NOT_FOUND',
                'Cliente não encontrado.',
                404
            );
        }

        const address = payload.enderecos[0];
        if (!address) {
            throw new AppError(
                'CLIENT_ADDRESS_REQUIRED', 
                'Envie pelo menos um endereço.', 
                400
            );
        }

        const addressClient = await tx.cliente_endereco.findFirst({
            where: { clienteId: clientId },
            select: { id: true },
        });

        if (!addressClient) {
            throw new AppError(
                'CLIENT_ADDRESS_NOT_FOUND', 
                'Cliente não possui endereço cadastrado.', 
                404
            );
        }

        await updateClientData(tx, clientId, payload, addressClient.id, address);
        await updateCaretakers(tx, clientId, payload.cuidadores);
        await updatePaymentData(tx, clientId, payload.dadosPagamento);
        await updateSchoolData(tx, clientId, payload.dadosEscola);
    });
}

interface ClientListFilters {
    q?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
}

interface ClientListResult {
    items: ClientType.DBClientQueryPage[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export async function list(
    therapistId: string,
    filters: ClientListFilters = {},
): Promise<ClientListResult> {
    if (!therapistId) {
        throw new AppError('REQUIRED_THERAPIST_ID', 'ID do terapeuta é obrigatório.', 400);
    }

    const visibility = await getVisibilityScope(therapistId);

    if (visibility.scope === 'none') {
        return { items: [], total: 0, page: 1, pageSize: filters.pageSize ?? 10, totalPages: 0 };
    }

    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.max(filters.pageSize ?? 10, 1);
    const [sortField = 'nome', sortDirection = 'asc'] = (filters.sort ?? 'nome_asc').split('_') as [
        string,
        'asc' | 'desc',
    ];
    const allowedSortFields = new Set(['nome', 'emailContato', 'status', 'dataNascimento']);
    const orderBy: Prisma.clienteOrderByWithRelationInput = allowedSortFields.has(sortField)
        ? { [sortField]: sortDirection === 'desc' ? 'desc' : 'asc' }
        : { nome: 'asc' };

    const where: Prisma.clienteWhereInput = {
        ...(filters.q
            ? {
                  OR: [
                      { nome: { contains: filters.q } },
                      { emailContato: { contains: filters.q } },
                      { cpf: { contains: filters.q } },
                      {
                          cuidadores: {
                              some: {
                                  OR: [
                                      { nome: { contains: filters.q } },
                                      { telefone: { contains: filters.q } },
                                      { cpf: { contains: filters.q } },
                                  ],
                              },
                          },
                      },
                  ],
              }
            : {}),
    };

    if (visibility.scope === 'partial') {
        where.terapeuta = {
            some: {
                terapeuta_id: { in: visibility.therapistIds },
            },
        };
    }

    if (visibility.maxAccessLevel < MANAGER_LEVEL) {
        where.status = 'ativo';
    }

    const [total, items] = await prisma.$transaction([
        prisma.cliente.count({ where }),
        prisma.cliente.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                nome: true,
                emailContato: true,
                cuidadores: {
                    select: {
                        telefone: true,
                        nome: true,
                        cpf: true,
                    },
                    take: 1,
                },
                status: true,
                dataNascimento: true,
                enderecos: {
                    select: {
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
                arquivos: {
                    select: {
                        tipo: true,
                        mime_type: true,
                        arquivo_id: true,
                        tamanho: true,
                        data_upload: true,
                    },
                },
            },
        }),
    ]);

    return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}

export async function getClientReport() {
    return prisma.cliente.findMany({
        select: {
            id: true,
            nome: true,
        },
    });
}

export async function countActiveClients() {
    return prisma.cliente.count({
        where: {
            status: 'ativo',
        },
    });
}

function generateResetToken() {
    const token = uuidv4();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    return { token, expiry };
}
