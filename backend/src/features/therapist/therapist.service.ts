import { prisma } from "../../config/database.js";
import * as TherapistTypes from './therapist.types.js';
import { brMoneyToNumber } from '../../utils/brMoney.js';
import { generateResetToken } from "../../utils/resetToken.js";

export async function create(dto: TherapistTypes.TherapistForm) {
  const { token, expiry } = generateResetToken();

  const therapist = await prisma.terapeuta.create ({
    data: {
      nome: dto.nome,
      email: dto.email,
      email_indigo: dto.emailIndigo,
      celular: dto.celular,
      telefone: dto.telefone,
      cpf: dto.cpf,
      data_nascimento: new Date(dto.dataNascimento),
      possui_veiculo: dto.possuiVeiculo === 'sim',
      placa_veiculo: dto.placaVeiculo,
      modelo_veiculo: dto.modeloVeiculo,
      banco: dto.banco,
      agencia: dto.agencia,
      conta: dto.conta,
      chave_pix: dto.chavePix,
      valor_hora: brMoneyToNumber(dto.valorHoraAcordado),
      professor_uni: dto.professorUnindigo === 'sim',
      endereco: {
        create: {
          cep: dto.endereco.cep,
          rua: dto.endereco.rua,
          numero: dto.endereco.numero,
          bairro: dto.endereco.bairro,
          complemento: dto.endereco.complemento,
          cidade: dto.endereco.cidade,
          uf: dto.endereco.estado,
        },
      },
      data_entrada: new Date(dto.dataInicio),
      data_saida: dto.dataFim ? new Date(dto.dataFim) : null,
      perfil_acesso: 'terapeuta',
      token_redefinicao: token,
      validade_token: expiry,
      ...(dto.documentos?.length
        ? {
            documentos_terapeuta: {
              createMany: {
                data: dto.documentos.map((doc) => ({
                  tipo_documento: doc.tipo_documento,
                  view_url: doc.view_url,
                  download_url: doc.download_url,
                  data_upload: new Date(doc.data_upload),
                })),
              },
            },
          }
        : {}),
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
          participacao_congressos: dto.formacao.participacaoCongressosDescricao,
          publicacoes_descricao: dto.formacao.publicacoesLivrosDescricao,
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
      pessoa_juridica: {
        create: {
          cnpj: dto.cnpj.numero,
          razao_social: dto.cnpj.razaoSocial,
          endereco: {
            create: {
              cep: dto.cnpj.endereco.cep,
              rua: dto.cnpj.endereco.rua,
              numero: dto.cnpj.endereco.numero,
              bairro: dto.cnpj.endereco.bairro,
              complemento: dto.cnpj.endereco.complemento,
              cidade: dto.cnpj.endereco.cidade,
              uf: dto.cnpj.endereco.estado,
            },
          },
        },
      },
      disciplina: { create: { nome: dto.disciplinaUniindigo } },
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
      documentos_terapeuta: true,
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
      documentos_terapeuta: true,
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