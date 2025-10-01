import { prisma } from "../../config/database.js";
import { AppError } from "../../errors/AppError.js";
import * as ClientType from "./client.types.js";
import { v4 as uuidv4 } from "uuid";

export async function create(dto: ClientType.Client) {
  const existsCpf = await prisma.cliente.findFirst({ where: { cpf: dto.cpf } });
  if (existsCpf) throw new AppError('CPF_DUPLICADO', 'CPF já cadastrado', 409);

  const existsEmail = await prisma.cliente.findUnique({ where: { emailContato: dto.emailContato } });
  if (existsEmail) throw new AppError('EMAIL_DUPLICADO', 'E-mail já cadastrado', 409);

  const { token, expiry } = generateResetToken();
  const now = new Date();
  const dataSaida = dto.dataSaida ? new Date(dto.dataSaida) : null;

  const dtoStatus =
    !dataSaida || dataSaida > now
      ? 'ativo'
      : 'inativo';

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
          
          endereco: {
            create: {
              cep: c.endereco?.cep,
              rua: c.endereco?.logradouro,
              numero: c.endereco?.numero,
              bairro: c.endereco?.bairro,
              cidade: c.endereco?.cidade,
              uf: c.endereco?.uf,
              complemento: c.endereco?.complemento ?? null,
            },
          },
        })),
      },

      enderecos: {
        create: dto.enderecos.map((e) => ({
          residenciaDe: e.residenciaDe ?? null,
          outroResidencia: e.outroResidencia ?? null,
          endereco: {
            connectOrCreate: {
              where: {
                unique_endereco: {
                  cep: e.cep ?? '',
                  rua: e.logradouro ?? '',
                  numero: e.numero ?? '',
                  bairro: e.bairro ?? '',
                  cidade: e.cidade ?? '',
                  uf: e.uf ?? '',
                  complemento: e.complemento ?? '',
                },
              },
              create: {
                cep: e.cep,
                rua: e.logradouro,
                numero: e.numero,
                bairro: e.bairro,
                cidade: e.cidade,
                uf: e.uf,
                complemento: e.complemento ?? null,
              }
            },
          },
        })),
      },

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
            create: {
              cep: dto.dadosEscola.endereco.cep ?? null,
              rua: dto.dadosEscola.endereco.logradouro ?? null,
              numero: dto.dadosEscola.endereco.numero ?? null,
              bairro: dto.dadosEscola.endereco.bairro ?? null,
              cidade: dto.dadosEscola.endereco.cidade ?? null,
              uf: dto.dadosEscola.endereco.uf ?? null,
              complemento: dto.dadosEscola.endereco.complemento ?? null,
            },
          },

          contatos: {
            create: dto.dadosEscola.contatos.map((c) => ({
              nome: c.nome,
              telefone: c.telefone,
              email: c.email,
              funcao: c.funcao,
            }))
          },
        },
      },

      arquivos: {
        create: dto.arquivos?.map((a) => ({
          tipo: a.tipo,
          arquivo_id: a.arquivo_id,
          mime_type: a.mime_type,
          tamanho: a.tamanho,
          data_upload: new Date(a.data_upload),
        })) ?? [],
      },
    }
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
        relacao: true,
        descricaoRelacao: true,
        nome: true,
        cpf: true,
        profissao: true,
        escolaridade: true,
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
      },
    },

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
  }
 });
}

export async function list() {
 return prisma.cliente.findMany({
  select: {
    id:true,
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
  }
 });
}

export async function getClientReport() {
  return prisma.cliente.findMany({
    select: {
      id: true,
      nome: true,
    }
  })
}

export async function countActiveClients() {
  return prisma.cliente.count({
    where: {
      status: 'ativo',
    }
  });
}

function generateResetToken() {
  const token = uuidv4();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 1);
  return { token, expiry };
}