import type { Prisma } from '@prisma/client';
import { prisma } from "../../config/database.js";
import * as TherapistTypes from './therapist.types.js';
import * as TherapistNormalize from './therapist.normalizer.js';
import { brMoneyToNumber } from '../../utils/brMoney.js';
import { generateResetToken } from "../../utils/resetToken.js";
import { AppError } from "../../errors/AppError.js";
import type { UpdateTherapistSchemaInput } from '../../schemas/therapist.schema.js';
import { ACCESS_LEVELS } from '../../utils/accessLevels.js';

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
          complemento: dto.endereco.complemento ?? null,
          cidade: dto.endereco.cidade,
          uf: dto.endereco.estado,
        },
      },

      data_entrada: new Date(dto.dataInicio),
      data_saida: dto.dataFim ? new Date(dto.dataFim) : null,
      perfil_acesso: getHighestAccessRole(dto.dadosProfissionais),
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
          graduacao: dto.formacao.graduacao,
          instituicao_graduacao: dto.formacao.instituicaoGraduacao,
          ano_formatura: Number(dto.formacao.anoFormatura),
          participacao_congressos: dto.formacao.participacaoCongressosDescricao ?? null,
          publicacoes_descricao: dto.formacao.publicacoesLivrosDescricao ?? null,
          pos_graduacao: {
            createMany: {
              data: dto.formacao.posGraduacoes.map((d) => ({
                tipo: d.tipo,
                curso: d.curso,
                instituicao: d.instituicao,
                conclusao: d.conclusao,
              })),
            },
          }
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
                    complemento: dto.cnpj.endereco?.complemento ?? null,
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
      email: true,
      nome: true,
      token_redefinicao: true,
    }
  });
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

export async function update(id: string, dto: UpdateTherapistSchemaInput) {
  const existing = await prisma.terapeuta.findUnique({
    where: { id },
    include: { endereco: true },
  });

  if (!existing) {
    throw new AppError('THERAPIST_NOT_FOUND', 'Terapeuta não encontrado', 404);
  }

  if (dto.cpf && dto.cpf !== existing.cpf) {
    const existsCpf = await prisma.terapeuta.findUnique({ where: { cpf: dto.cpf } });
    if (existsCpf) throw new AppError('CPF_DUPLICATED', 'CPF já cadastrado!', 409);
  }

  if (dto.email && dto.email !== existing.email) {
    const existsEmail = await prisma.terapeuta.findUnique({ where: { email: dto.email } });
    if (existsEmail) throw new AppError('EMAIL_DUPLICADO', 'E-mail já cadastrado', 409);
  }

  if (dto.emailIndigo && dto.emailIndigo !== existing.email_indigo) {
    const existsEmailIndigo = await prisma.terapeuta.findUnique({ where: { email_indigo: dto.emailIndigo } });
    if (existsEmailIndigo) throw new AppError('EMAIL_DUPLICADO', 'E-mail já cadastrado', 409);
  }

  const data: Prisma.terapeutaUpdateInput = {};

  if (dto.nome !== undefined) data.nome = dto.nome.trim();
  if (dto.email !== undefined) data.email = dto.email.trim();
  if (dto.emailIndigo !== undefined) data.email_indigo = dto.emailIndigo.trim();
  if (dto.telefone !== undefined) data.telefone = TherapistNormalize.normalizeTherapistNullableString(dto.telefone) ?? null;
  if (dto.celular !== undefined) {
    const celular = TherapistNormalize.normalizeTherapistNullableString(dto.celular);
    if (!celular) {
      throw new AppError('CELULAR_OBRIGATORIO', 'Celular é obrigatório', 400);
    }
    data.celular = celular;
  }
  if (dto.cpf !== undefined) data.cpf = dto.cpf;

  if (dto.dataNascimento !== undefined) {
    const parsed = TherapistNormalize.normalizeTherapistDate(dto.dataNascimento);
    if (!parsed) {
      throw new AppError('DATA_NASCIMENTO_OBRIGATORIA', 'Data de nascimento é obrigatória', 400);
    }
    data.data_nascimento = parsed;
  }

  if (dto.possuiVeiculo !== undefined) {
    data.possui_veiculo = dto.possuiVeiculo === 'sim';
  }

  if (dto.placaVeiculo !== undefined) {
    const placa = TherapistNormalize.normalizeTherapistNullableString(dto.placaVeiculo);
    data.placa_veiculo = placa ? placa.toUpperCase() : null;
  }

  if (dto.modeloVeiculo !== undefined) {
    data.modelo_veiculo = TherapistNormalize.normalizeTherapistNullableString(dto.modeloVeiculo) ?? null;
  }

  if (dto.banco !== undefined) data.banco = TherapistNormalize.normalizeTherapistNullableString(dto.banco) ?? null;
  if (dto.agencia !== undefined) data.agencia = TherapistNormalize.normalizeTherapistNullableString(dto.agencia) ?? null;
  if (dto.conta !== undefined) data.conta = TherapistNormalize.normalizeTherapistNullableString(dto.conta) ?? null;
  if (dto.chavePix !== undefined) data.chave_pix = TherapistNormalize.normalizeTherapistNullableString(dto.chavePix) ?? null;
  if (dto.pixTipo !== undefined) data.pix_tipo = dto.pixTipo;

  if (dto.valorHoraAcordado !== undefined) {
    const value = brMoneyToNumber(dto.valorHoraAcordado);
    data.valor_hora = value;
  }

  if (dto.professorUnindigo !== undefined) {
    data.professor_uni = dto.professorUnindigo === 'sim';
  }

  if (dto.dataInicio !== undefined) {
    const parsed = TherapistNormalize.normalizeTherapistDate(dto.dataInicio);
    if (!parsed) {
      throw new AppError('DATA_INICIO_INVALIDA', 'Data de início inválida', 400);
    }
    data.data_entrada = parsed;
  }

  if (dto.dataFim !== undefined) {
    if (dto.dataFim === null) {
      data.data_saida = null;
    } else {
      const parsed = TherapistNormalize.normalizeTherapistDate(dto.dataFim);
      if (parsed !== undefined) {
        data.data_saida = parsed;
      }
    }
  }

  if (dto.endereco !== undefined) {
    const normalizedEndereco = TherapistNormalize.normalizeTherapistEnderecoUpdate(dto.endereco);

    if (normalizedEndereco.hasChanges) {
      data.endereco = existing.endereco
        ? { update: normalizedEndereco.update }
        : { create: normalizedEndereco.create };
    }
  }

  if (Object.keys(data).length === 0) {
    return getById(id);
  }

  await prisma.terapeuta.update({
    where: { id },
    data,
  });

  return getById(id);
}

function getHighestAccessRole(professionalData: TherapistTypes.TherapistForm['dadosProfissionais']): string {
  if (!professionalData?.length) return 'Terapeuta Clínico';

  let highest = { cargo: 'Terapeuta Clínico', level: 1 };

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