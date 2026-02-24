import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import * as TherapistTypes from './therapist.types.js';
import { generateResetToken } from '../../utils/resetToken.js';
import { AppError } from '../../errors/AppError.js';
import { ACCESS_LEVELS } from '../../utils/accessLevels.js';
import { invalidateTherapistCache } from '../../cache/therapistCache.js';
import { getVisibilityScope } from '../../utils/visibilityFilter.js';
import type { TherapistSchemaInput } from '../../schemas/therapist.schema.js';
import { buildAddress } from '../../utils/buildAddress.js';
import { getAccessLevelFromRoles } from '../../utils/normalizeRoleName.js';
import { queryTherapist } from './querys/queryTherapist.js';
import { mapTherapist } from './mappers/mapTherapist.js';
import { getPrimaryAreaFromAreaRoles } from '../../utils/getPrimaryAreaFromAreaRoles.js';

const MANAGER_LEVEL = ACCESS_LEVELS['gerente'] ?? 5;

export async function create(dto: TherapistSchemaInput) {
    const { token, expiry } = generateResetToken();
    const now = new Date();

    const data: Prisma.terapeutaCreateInput = {
        nome: dto.nome,
        email: dto.email,
        email_indigo: dto.emailIndigo,
        telefone: dto.telefone,
        celular: dto.celular,
        cpf: dto.cpf,
        data_nascimento: dto.dataNascimento,
        possui_veiculo: dto.possuiVeiculo,
        placa_veiculo: dto.placaVeiculo,
        modelo_veiculo: dto.modeloVeiculo,
        banco: dto.banco,
        agencia: dto.agencia,
        conta: dto.conta,
        pix_tipo: dto.pixTipo,
        chave_pix: dto.chavePix,
        professor_uni: dto.professorUnindigo,
        data_entrada: dto.dataInicio,
        data_saida: dto.dataFim,
        perfil_acesso: getAccessLevelFromRoles(dto.dadosProfissionais.map((t) => t.cargo)).role,
        atividade: !dto.dataFim || dto.dataFim >= now,
        token_redefinicao: token,
        validade_token: expiry,
    }

    const subjects = dto.disciplinaUniindigo ? [dto.disciplinaUniindigo] : [];
    if (subjects.length > 0) {
        data.disciplina = {
            connectOrCreate: subjects.map((nome) => ({
                where: { nome },
                create: { nome },
            })),
        };
    }

    if (dto.endereco) {
        const endereco = buildAddress(dto.endereco);

        data.endereco = {
            create: endereco,
        };
    }

    if (dto.formacao) {
        const createTraining: Prisma.formacaoCreateWithoutTerapeutaInput = {
            graduacao: dto.formacao.graduacao,
            instituicao_graduacao: dto.formacao.instituicaoGraduacao,
            ano_formatura: dto.formacao.anoFormatura,
            participacao_congressos: dto.formacao.participacaoCongressosDescricao,
            publicacoes_descricao: dto.formacao.publicacoesLivrosDescricao,
        };

        if (dto.formacao.posGraduacoes.length > 0) {
            createTraining.pos_graduacao = {
                create: dto.formacao.posGraduacoes.map((pg) => ({
                    tipo: pg.tipo,
                    curso: pg.curso,
                    instituicao: pg.instituicao,
                    conclusao: pg.conclusao,
                })),
            };
        }

        data.formacao = { create: createTraining };
    }

    if (dto.cnpj) {
        const endereco = buildAddress(dto.cnpj.endereco);

        data.pessoa_juridica = {
            create: {
                cnpj: dto.cnpj.numero,
                razao_social: dto.cnpj.razaoSocial,
                endereco: {
                    create: endereco,
                }
            }
        }
    }

    if (dto.dadosProfissionais.length > 0) {
        data.registro_profissional = {
            createMany: {
                data: dto.dadosProfissionais.map((registro) => ({
                    numero_conselho: registro.numeroConselho,
                    area_atuacao_id: registro.areaAtuacaoId,
                    cargo_id: registro.cargoId,
                })),
            },
        };
    }

    const therapist = await prisma.$transaction(async (tx) => {
        const created = await tx.terapeuta.create({
            data,
            select: { 
                id: true,
                nome: true,
                email: true,
                token_redefinicao: true,
            },
        });

        return created;
    });

    invalidateTherapistCache(therapist.id);
    return therapist;
}

interface TherapistListFilters {
    q?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
}

interface TherapistListResult {
    items: TherapistTypes.TherapistDB[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export async function list(
    therapistId: string,
    filters: TherapistListFilters = {},
): Promise<TherapistListResult> {
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
    const allowedSortFields = new Set(['nome', 'email', 'email_indigo', 'cpf']);
    const orderBy: Prisma.terapeutaOrderByWithRelationInput = allowedSortFields.has(sortField)
        ? { [sortField]: sortDirection === 'desc' ? 'desc' : 'asc' }
        : { nome: 'asc' };

    const where: Prisma.terapeutaWhereInput = {
        ...(filters.q
            ? {
                  OR: [
                      { nome: { contains: filters.q } },
                      { email: { contains: filters.q } },
                      { email_indigo: { contains: filters.q } },
                      { telefone: { contains: filters.q } },
                      { celular: { contains: filters.q } },
                      { cpf: { contains: filters.q } },
                      {
                          registro_profissional: {
                              some: {
                                  OR: [
                                      { numero_conselho: { contains: filters.q } },
                                      { cargo: { nome: { contains: filters.q } } },
                                      { area_atuacao: { nome: { contains: filters.q } } },
                                  ],
                              },
                          },
                      },
                  ],
              }
            : {}),
    };

    if (visibility.scope === 'partial') {
        where.id = { in: visibility.therapistIds };
    }

    if (visibility.maxAccessLevel < MANAGER_LEVEL) {
        where.atividade = true;
    }

    const [total, items] = await prisma.$transaction([
        prisma.terapeuta.count({ where }),
        prisma.terapeuta.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                endereco: true,
                formacao: { include: { pos_graduacao: true } },
                registro_profissional: { include: { area_atuacao: true, cargo: true } },
                arquivos: true,
                pessoa_juridica: { include: { endereco: true } },
                disciplina: true,
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

export async function getById(therapistId: string) {
    const therapist = await prisma.terapeuta.findUnique({
        where: { id: therapistId },
        select: queryTherapist,
    });

    if (!therapist) {
        throw new AppError(
            'THERAPIST_NOT_FOUND',
            'Terapeuta não encontrado',
            404
        );
    }

    return mapTherapist(therapist);
}

export async function fetchTherapistSummaryById(therapistId: string) {
    const therapist = await prisma.terapeuta.findUnique({
        where: { id: therapistId },
        select: {
            id: true,
            nome: true,
            registro_profissional: {
                select: {
                    cargo: { select: { nome: true } },
                    area_atuacao: { select: { nome: true } },
                },
            },
            arquivos: {
                where: { tipo: 'fotoPerfil' },
                select: {
                    arquivo_id: true,
                },
            }
        }
    });

    if (!therapist) {
        throw new AppError(
            'THERAPIST_NOT_FOUND',
            'Terapeuta não encontrado',
            404
        );
    }

    const therapistAvatar = therapist.arquivos[0] ? therapist.arquivos[0].arquivo_id : null;

    return {
        id: therapist.id,
        nome: therapist.nome,
        especialidade: getPrimaryAreaFromAreaRoles(
            therapist.registro_profissional.map((r) => ({
                area: r.area_atuacao?.nome ?? null,
                role: r.cargo?.nome ?? null,
            }))
        ).area,
        photoUrl: therapistAvatar ? `/api/arquivos/${encodeURIComponent(therapistAvatar)}/view` : null,
    }
}

export async function getTherapistReport(therapistId: string) {
    const visibility = await getVisibilityScope(therapistId);

    if (visibility.scope === 'none') {
        return [];
    }

    const where: Prisma.terapeutaWhereInput = {};

    if (visibility.scope === 'partial') {
        where.id = { in: visibility.therapistIds };
    }

    if (visibility.maxAccessLevel < MANAGER_LEVEL) {
        where.atividade = true;
    }

    return prisma.terapeuta.findMany({
        where,
        select: {
            id: true,
            nome: true,
        },
    });
}

export async function update(id: string, dto: TherapistTypes.TherapistForm) {
    let atividade = true;
    if (dto.dataFim) {
        if (dto.dataFim < dto.dataInicio) {
            throw new AppError(
                'INVALID_EXIT_DATE',
                'Data de saida deve ser maior ou igual a data de entrada.',
                422,
            );
        } else {
            atividade = false;
        }
    }

    invalidateTherapistCache(id);

    return prisma.terapeuta.update({
        where: { id },
        data: {
            nome: dto.nome,
            email: dto.email,
            email_indigo: dto.emailIndigo,
            telefone: dto.telefone,
            celular: dto.celular,
            cpf: dto.cpf,
            data_nascimento: dto.dataNascimento,
            possui_veiculo: typeof dto.possuiVeiculo === 'boolean' ? dto.possuiVeiculo : dto.possuiVeiculo === 'sim',
            placa_veiculo: dto.placaVeiculo,
            modelo_veiculo: dto.modeloVeiculo,
            banco: dto.banco,
            agencia: dto.agencia,
            conta: dto.conta,
            chave_pix: dto.chavePix,
            pix_tipo: dto.pixTipo,

            endereco: {
                create: {
                    cep: dto.endereco.cep,
                    rua: dto.endereco.rua,
                    numero: dto.endereco.numero,
                    complemento: dto.endereco.complemento || '',
                    bairro: dto.endereco.bairro,
                    cidade: dto.endereco.cidade,
                    uf: dto.endereco.estado,
                },
            },

            registro_profissional: {
                deleteMany: {},
                create: dto.dadosProfissionais.map((d) => ({
                    numero_conselho: d.numeroConselho,
                    area_atuacao: {
                        connect: { id: Number(d.areaAtuacaoId) },
                    },
                    cargo: {
                        connect: { id: Number(d.cargoId) },
                    },
                })),
            },

            data_entrada: dto.dataInicio,
            data_saida: dto.dataFim ?? null,
            atividade,
            professor_uni: typeof dto.professorUnindigo === 'boolean' ? dto.professorUnindigo : dto.professorUnindigo === 'sim',
            perfil_acesso: getHighestAccessRole(dto.dadosProfissionais),

            ...(dto.disciplinaUniindigo
                ? {
                      disciplina: {
                          deleteMany: {},
                          connectOrCreate: {
                              where: { nome: dto.disciplinaUniindigo },
                              create: { nome: dto.disciplinaUniindigo },
                          },
                      },
                  }
                : {}),

            formacao: {
                upsert: {
                    update: {
                        graduacao: dto.formacao?.graduacao ?? null,
                        instituicao_graduacao: dto.formacao?.instituicaoGraduacao ?? null,
                        ano_formatura: Number(dto.formacao?.anoFormatura),
                        participacao_congressos:
                            dto.formacao?.participacaoCongressosDescricao ?? null,
                        publicacoes_descricao: dto.formacao?.publicacoesLivrosDescricao ?? null,
                        pos_graduacao: {
                            deleteMany: {},
                            create:
                                dto.formacao?.posGraduacoes?.map((p) => ({
                                    tipo: p.tipo,
                                    curso: p.curso,
                                    instituicao: p.instituicao,
                                    conclusao: p.conclusao,
                                })) ?? [],
                        },
                    },
                    create: {
                        graduacao: dto.formacao?.graduacao ?? null,
                        instituicao_graduacao: dto.formacao?.instituicaoGraduacao ?? null,
                        ano_formatura: Number(dto.formacao?.anoFormatura),
                        participacao_congressos:
                            dto.formacao?.participacaoCongressosDescricao ?? null,
                        publicacoes_descricao: dto.formacao?.publicacoesLivrosDescricao ?? null,
                        pos_graduacao: {
                            create:
                                dto.formacao?.posGraduacoes?.map((p) => ({
                                    tipo: p.tipo,
                                    curso: p.curso,
                                    instituicao: p.instituicao,
                                    conclusao: p.conclusao,
                                })) ?? [],
                        },
                    },
                },
            },

            ...(dto.cnpj
                ? {
                      pessoa_juridica: {
                          upsert: {
                              update: {
                                  cnpj: dto.cnpj.numero ?? null,
                                  razao_social: dto.cnpj.razaoSocial ?? null,
                                  endereco: {
                                      upsert: {
                                          update: {
                                              cep: dto.cnpj.endereco?.cep ?? null,
                                              rua: dto.cnpj.endereco?.rua ?? null,
                                              numero: dto.cnpj.endereco?.numero ?? null,
                                              complemento: dto.cnpj.endereco?.complemento ?? '',
                                              bairro: dto.cnpj.endereco?.bairro ?? null,
                                              cidade: dto.cnpj.endereco?.cidade ?? null,
                                              uf: dto.cnpj.endereco?.estado ?? null,
                                          },
                                          create: {
                                              cep: dto.cnpj.endereco?.cep ?? null,
                                              rua: dto.cnpj.endereco?.rua ?? null,
                                              numero: dto.cnpj.endereco?.numero ?? null,
                                              complemento: dto.cnpj.endereco?.complemento ?? '',
                                              bairro: dto.cnpj.endereco?.bairro ?? null,
                                              cidade: dto.cnpj.endereco?.cidade ?? null,
                                              uf: dto.cnpj.endereco?.estado ?? null,
                                          },
                                      },
                                  },
                              },
                              create: {
                                  cnpj: dto.cnpj.numero ?? null,
                                  razao_social: dto.cnpj.razaoSocial ?? null,
                                  endereco: {
                                      create: {
                                          cep: dto.cnpj.endereco?.cep ?? null,
                                          rua: dto.cnpj.endereco?.rua ?? null,
                                          numero: dto.cnpj.endereco?.numero ?? null,
                                          complemento: dto.cnpj.endereco?.complemento ?? '',
                                          bairro: dto.cnpj.endereco?.bairro ?? null,
                                          cidade: dto.cnpj.endereco?.cidade ?? null,
                                          uf: dto.cnpj.endereco?.estado ?? null,
                                      },
                                  },
                              },
                          },
                      },
                  }
                : {}),
        },
    });
}

function getHighestAccessRole(
    professionalData: TherapistTypes.TherapistForm['dadosProfissionais'],
): string {
    if (!professionalData?.length) return 'Terapeuta Clínico';

    let highest = { cargo: 'teste', level: 0 };

    for (const { cargo } of professionalData) {
        const normalized = normalizeCargo(cargo ?? '');
        const level = ACCESS_LEVELS[normalized] ?? 0;
        if (level >= highest.level) highest = { cargo: normalized, level };
    }

    return highest.cargo;
}

function normalizeCargo(cargo: string): string {
    return cargo
        .normalize('NFD') // separa acentos
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .trim()
        .toLowerCase();
}
