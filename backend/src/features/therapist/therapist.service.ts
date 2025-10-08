import { prisma } from "../../config/database.js";
import * as TherapistTypes from './therapist.types.js';
import { brMoneyToNumber } from '../../utils/brMoney.js';
import { generateResetToken } from "../../utils/resetToken.js";
import { AppError } from "../../errors/AppError.js";

export async function create(dto: TherapistTypes.TherapistForm) {
  const existsCpf = await prisma.terapeuta.findUnique({ where: { cpf: dto.cpf } });
  if (existsCpf) throw new AppError('CPF_DUPLICADO', 'CPF já cadastrado!', 409);

  const existsEmail = await prisma.terapeuta.findUnique({ where: { email_indigo: dto.emailIndigo } });
  if (existsEmail) throw new AppError('EMAIL_DUPLICADO', 'E-mail já cadastrado', 409);

  const { token, expiry } = generateResetToken();

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

      registro_profissional: {
        createMany: {
          data: dto.dadosProfissionais.map((d) => ({
            area_atuacao: d.areaAtuacao,
            cargo: d.cargo,
            numero_conselho: d.numeroConselho,
          })),
        },
      },

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
      registro_profissional: true,
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
      registro_profissional: true,
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