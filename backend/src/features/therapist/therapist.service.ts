import { prisma } from "../../config/database.js";
import * as TherapistTypes from './therapist.types.js';
import { brMoneyToNumber } from '../../utils/brMoney.js';
import { generateResetToken } from "../../utils/resetToken.js";
import { AppError } from "../../errors/AppError.js";
import { ACCESS_LEVELS } from '../../utils/accessLevels.js';
import { invalidateTherapistCache } from "../../cache/therapistCache.js";

async function resolveAreaAtuacaoId(
  areaAtuacaoId: TherapistTypes.TherapistProfessionalDataInput['areaAtuacaoId'],
  areaAtuacaoNome: string,
) {
  if (areaAtuacaoId != null && areaAtuacaoId !== '') {
    const parsedId = Number(areaAtuacaoId);
    if (!Number.isNaN(parsedId) && parsedId > 0) {
      const exists = await prisma.area_atuacao.findUnique({ select: { id: true }, where: { id: parsedId } });
      if (exists) {
        return exists.id;
      }
    }
  }

  const normalizedName = areaAtuacaoNome?.trim();
  if (!normalizedName) {
    throw new AppError(
      'INVALID_AREA_ACTIVITY',
      'Área de atuação inválida. Selecione uma área de atuação cadastrada.',
      400,
    );
  }

  const area = await prisma.area_atuacao.findFirst({
    where: {
      nome: normalizedName
    },
    select: { id: true },
  });

  if (!area) {
    throw new AppError(
      'INVALID_AREA_ACTIVITY',
      'Área de atuação inválida. Selecione uma área de atuação cadastrada.',
      400,
    );
  }

  return area.id;
}

async function resolveCargoId(
  cargoId: TherapistTypes.TherapistProfessionalDataInput['cargoId'],
  cargoNome: string,
) {
    if (cargoId != null && cargoId !== '') {
      const parsedId = Number(cargoId);
      if (!Number.isNaN(parsedId) && parsedId > 0) {
        const exists = await prisma.cargo.findUnique({ select: { id: true }, where: { id: parsedId } });
        if (exists) {
          return exists.id;
        }
      }
    }

    const normalizedName = cargoNome?.trim();
    if (!normalizedName) {
      return null;
    }

    const cargo = await prisma.cargo.findFirst({
      where: {
        nome: normalizedName
      },
      select: { id: true },
    });

    if (!cargo) {
      throw new AppError(
        'INVALID_POSITION',
        'Cargo inválido. Selecione um cargo cadastrado.',
        400,
      );
    }

    return cargo.id;
}

export async function create(dto: TherapistTypes.TherapistForm) {
  const existsCpf = await prisma.terapeuta.findUnique({ where: { cpf: dto.cpf } });
  if (existsCpf) throw new AppError('CPF_DUPLICADO', 'CPF já cadastrado!', 409);

  const existsEmail = await prisma.terapeuta.findUnique({ where: { email_indigo: dto.emailIndigo } });
  if (existsEmail) throw new AppError('EMAIL_DUPLICADO', 'E-mail já cadastrado', 409);

  const { token, expiry } = generateResetToken();

  const professionalRegistrations = await Promise.all(
    (dto.dadosProfissionais ?? []).map(async (data) => ({
      area_atuacao_id: await resolveAreaAtuacaoId(data.areaAtuacaoId, data.areaAtuacao),
      cargo_id: await resolveCargoId(data.cargoId, data.cargo),
      numero_conselho: data.numeroConselho || null,
    })),
  );

  const therapist = await prisma.terapeuta.create ({
    data: {
      nome: dto.nome,
      email: dto.email,
      email_indigo: dto.emailIndigo,
      celular: dto.celular,
      telefone: dto.telefone ?? null,
      cpf: dto.cpf,
      data_nascimento: new Date(dto.dataNascimento),
      possui_veiculo: dto.possuiVeiculo === 'sim',
      placa_veiculo: dto.placaVeiculo ?? null,
      modelo_veiculo: dto.modeloVeiculo ?? null,
      banco: dto.banco,
      agencia: dto.agencia,
      conta: dto.conta,
      chave_pix: dto.chavePix,
      pix_tipo: dto.pixTipo,
      valor_hora: brMoneyToNumber(dto.valorHoraAcordado),
      professor_uni: dto.professorUnindigo === 'sim',
      
      endereco: {
        create: {
          cep: dto.endereco.cep,
          rua: dto.endereco.rua,
          numero: dto.endereco.numero,
          bairro: dto.endereco.bairro,
          complemento: dto.endereco.complemento ?? '',
          cidade: dto.endereco.cidade,
          uf: dto.endereco.estado,
        },
      },

      data_entrada: new Date(dto.dataInicio),
      data_saida: dto.dataFim ? new Date(dto.dataFim) : null,
      perfil_acesso: 'gerente',
      token_redefinicao: token,
      validade_token: expiry,

      arquivos: {
        create: dto.arquivos?.map((a) => ({
          tipo: a.tipo,
          arquivo_id: a.arquivo_id,
          mime_type: a.mime_type,
          tamanho: a.tamanho,
          data_upload: new Date(a.data_upload),
        })) ?? [],
      },

      ...(professionalRegistrations.length
        ? {
          registro_profissional: {
            createMany: {
              data: professionalRegistrations,
            },
          },
        }
        : {}),

      formacao: {
        create: {
          graduacao: dto.formacao?.graduacao ?? null,
          instituicao_graduacao: dto.formacao?.instituicaoGraduacao ?? null,
          ano_formatura: Number(dto.formacao?.anoFormatura),
          participacao_congressos: dto.formacao?.participacaoCongressosDescricao ?? null,
          publicacoes_descricao: dto.formacao?.publicacoesLivrosDescricao ?? null,
          ...(dto.formacao?.posGraduacoes?.length
            ? {
                pos_graduacao: {
                  create: dto.formacao.posGraduacoes.map((p) => ({
                    tipo: p.tipo,
                    curso: p.curso,
                    instituicao: p.instituicao,
                    conclusao: p.conclusao,
                  })),
                },
              }
            : {}),
        }
      },

      ...(dto.cnpj?.numero?.trim()
        ? {
            pessoa_juridica: {
              create: {
                cnpj: dto.cnpj.numero.trim(),
                razao_social: dto.cnpj.razaoSocial ?? null,
                endereco: {
                  create: {
                    cep: dto.cnpj.endereco?.cep ?? null,
                    rua: dto.cnpj.endereco?.rua ?? null,
                    numero: dto.cnpj.endereco?.numero ?? null,
                    bairro: dto.cnpj.endereco?.bairro ?? null,
                    complemento: dto.cnpj.endereco?.complemento ?? '',
                    cidade: dto.cnpj.endereco?.cidade ?? null,
                    uf: dto.cnpj.endereco?.estado ?? null,
                  },
                },
              },
            },
          }
        : {}),

      ...(dto.disciplinaUniindigo
        ? { disciplina: { create: { nome: dto.disciplinaUniindigo } } }
        : {}),
    },
    select: {
      id: true,
      email: true,
      nome: true,
      token_redefinicao: true,
    }
  });

  invalidateTherapistCache(therapist.id);
  return therapist
};

export async function list():Promise<TherapistTypes.TherapistDB[]> {
  return prisma.terapeuta.findMany({
    include: {
      endereco: true,
      formacao: { include: { pos_graduacao: true } },
      registro_profissional: { include: { area_atuacao: true, cargo: true } },
      arquivos: true,
      pessoa_juridica: { include: { endereco: true } },
      disciplina: true,
    },
  });
}

export async function getById(therapistId: string) {
  return prisma.terapeuta.findFirst({
    where: { id: therapistId },
    include: {
      endereco: true,
      formacao: { include: { pos_graduacao: true } },
      registro_profissional: { include: { area_atuacao: true, cargo: true } },
      arquivos: true,
      pessoa_juridica: { include: { endereco: true } },
      disciplina: true,
    },
  });
}

export async function getTherapistReport() {
  return prisma.terapeuta.findMany({
    select: {
      id: true,
      nome: true,
    }
  });
}

export async function update(id: string, dto: TherapistTypes.TherapistForm) {
  let atividade = true;
  if (dto.dataFim) {
    if (dto.dataFim < dto.dataInicio) {
      throw new AppError('INVALID_EXIT_DATE', 'Data de saida deve ser maior ou igual a data de entrada.', 422);
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
      possui_veiculo: dto.possuiVeiculo === 'sim' ? true : false,
      placa_veiculo: dto.placaVeiculo,
      modelo_veiculo: dto.modeloVeiculo,
      banco: dto.banco,
      agencia: dto.agencia,
      conta: dto.conta,
      chave_pix: dto.chavePix,
      pix_tipo: dto.pixTipo,

      endereco: {
        connectOrCreate: {
          where: {
            unique_endereco: {
              cep: dto.endereco.cep,
              rua: dto.endereco.rua,
              numero: dto.endereco.numero,
              complemento: dto.endereco.complemento,
              bairro: dto.endereco.bairro,
              cidade: dto.endereco.cidade,
              uf: dto.endereco.estado,
            },
          },
          create: {
              cep: dto.endereco.cep,
              rua: dto.endereco.rua,
              numero: dto.endereco.numero,
              complemento: dto.endereco.complemento,
              bairro: dto.endereco.bairro,
              cidade: dto.endereco.cidade,
              uf: dto.endereco.estado,
          },
        },
      },

      registro_profissional: {
        deleteMany: {},
        create: dto.dadosProfissionais.map(d => ({
          numero_conselho: d.numeroConselho,
          area_atuacao: {
            connect: { id: Number(d.areaAtuacaoId) },
          },
          cargo: { 
            connect: { id: Number(d.cargoId) } 
          },
        })),
      },

      data_entrada: dto.dataInicio,
      data_saida: dto.dataFim ?? null,
      atividade,
      valor_hora: dto.valorHoraAcordado,
      professor_uni: dto.professorUnindigo === 'sim',
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
            participacao_congressos: dto.formacao?.participacaoCongressosDescricao ?? null,
            publicacoes_descricao: dto.formacao?.publicacoesLivrosDescricao ?? null,
            pos_graduacao: {
              deleteMany: {},
              create: dto.formacao?.posGraduacoes?.map((p) => ({
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
            participacao_congressos: dto.formacao?.participacaoCongressosDescricao ?? null,
            publicacoes_descricao: dto.formacao?.publicacoesLivrosDescricao ?? null,
            pos_graduacao: {
              create: dto.formacao?.posGraduacoes?.map((p) => ({
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
    }
  })
}

function getHighestAccessRole(professionalData: TherapistTypes.TherapistForm['dadosProfissionais']): string {
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