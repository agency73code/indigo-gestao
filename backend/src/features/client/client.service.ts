import { prisma } from "../../config/database.js";
import { AppError } from "../../errors/AppError.js";
import * as ClientType from "./client.types.js";
import type { UpdateClientSchemaInput } from "../../schemas/client.schema.js";
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

export async function update(id: string, dto: UpdateClientSchemaInput) {
  const existing = await prisma.cliente.findUnique({
    where: { id },
    include: {
      dadosPagamento: { select: { id: true, sistemaPagamento: true } },
      dadosEscola: { select: { id: true, tipoEscola: true } },
    },
  });

  if (!existing) {
    throw new AppError('CLIENTE_NAO_ENCONTRADO', 'Cliente não encontrado', 404);
  }

  if (dto.cpf && dto.cpf !== existing.cpf) {
    const existsCpf = await prisma.cliente.findFirst({ where: { cpf: dto.cpf, NOT: { id } } });
    if (existsCpf) throw new AppError('CPF_DUPLICADO', 'CPF já cadastrado', 409);
  }

  if (dto.emailContato && dto.emailContato !== existing.emailContato) {
    const existsEmail = await prisma.cliente.findFirst({ where: { emailContato: dto.emailContato, NOT: { id } } });
    if (existsEmail) throw new AppError('EMAIL_DUPLICADO', 'E-mail já cadastrado', 409);
  }

  const data: Record<string, unknown> = {};

  const toDate = (value: unknown) => {
    if (value === null || value === undefined) return value as null | undefined;
    if (value instanceof Date) return value;
    const parsed = new Date(value as string | number);
    if (Number.isNaN(parsed.getTime())) {
      throw new AppError('DATA_INVALIDA', 'Formato de data inválido', 400);
    }
    return parsed;
  };

  if (dto.nome !== undefined) data.nome = dto.nome;
  if (dto.cpf !== undefined) data.cpf = dto.cpf;
  if (dto.dataNascimento !== undefined) data.dataNascimento = dto.dataNascimento === null ? null : toDate(dto.dataNascimento);
  if (dto.emailContato !== undefined) data.emailContato = dto.emailContato;
  if (dto.dataEntrada !== undefined) data.dataEntrada = dto.dataEntrada === null ? null : toDate(dto.dataEntrada);
  if (dto.dataSaida !== undefined) {
    const dataSaida = dto.dataSaida === null ? null : toDate(dto.dataSaida);
    data.dataSaida = dataSaida;

    const now = new Date();
    data.status = !dataSaida || dataSaida > now ? 'ativo' : 'inativo';
  }

  if (dto.cuidadores !== undefined) {
    data.cuidadores = {
      deleteMany: { clienteId: id },
      create: (dto.cuidadores ?? []).map((c) => {
        if (!c?.endereco) {
          throw new AppError('ENDERECO_CUIDADOR_OBRIGATORIO', 'Endereço do cuidador é obrigatório', 400);
        }

        return {
          relacao: c.relacao ?? null,
          descricaoRelacao: c.descricaoRelacao ?? null,
          nome: c.nome ?? null,
          cpf: c.cpf ?? null,
          profissao: c.profissao ?? null,
          escolaridade: c.escolaridade ?? null,
          telefone: c.telefone ?? null,
          email: c.email ?? null,
          endereco: {
            create: {
              cep: c.endereco.cep ?? null,
              rua: (c.endereco as ClientType.EnderecoInput).rua ?? c.endereco.logradouro ?? null,
              numero: c.endereco.numero ?? null,
              bairro: c.endereco.bairro ?? null,
              cidade: c.endereco.cidade ?? null,
              uf: c.endereco.uf ?? null,
              complemento: c.endereco.complemento ?? null,
            },
          },
        };
      }),
    };
  }

  if (dto.enderecos !== undefined) {
    data.enderecos = {
      deleteMany: { clienteId: id },
      create: (dto.enderecos ?? []).map((e) => ({
        residenciaDe: e?.residenciaDe ?? null,
        outroResidencia: e?.outroResidencia ?? null,
        endereco: {
          connectOrCreate: {
            where: {
              unique_endereco: {
                cep: e?.cep ?? '',
                rua: e?.logradouro ?? '',
                numero: e?.numero ?? '',
                bairro: e?.bairro ?? '',
                cidade: e?.cidade ?? '',
                uf: e?.uf ?? '',
                complemento: e?.complemento ?? '',
              },
            },
            create: {
              cep: e?.cep ?? null,
              rua: e?.logradouro ?? null,
              numero: e?.numero ?? null,
              bairro: e?.bairro ?? null,
              cidade: e?.cidade ?? null,
              uf: e?.uf ?? null,
              complemento: e?.complemento ?? null,
            },
          },
        },
      })),
    };
  }

  if (dto.dadosPagamento !== undefined) {
    const pagamento = dto.dadosPagamento;
    const updatePagamento: Record<string, unknown> = {};
    const createPagamento: Record<string, unknown> = {
      sistemaPagamento:
        pagamento?.sistemaPagamento ?? existing.dadosPagamento?.sistemaPagamento ?? (() => {
          throw new AppError('SISTEMA_PAGAMENTO_OBRIGATORIO', 'Sistema de pagamento é obrigatório', 400);
        })(),
    };

    if (pagamento?.nomeTitular !== undefined) {
      updatePagamento.nomeTitular = pagamento.nomeTitular;
      createPagamento.nomeTitular = pagamento.nomeTitular ?? null;
    }

    if (pagamento?.numeroCarteirinha !== undefined) {
      updatePagamento.numeroCarteirinha = pagamento.numeroCarteirinha;
      createPagamento.numeroCarteirinha = pagamento.numeroCarteirinha ?? null;
    }

    if (pagamento?.telefone1 !== undefined) {
      updatePagamento.telefone1 = pagamento.telefone1;
      createPagamento.telefone1 = pagamento.telefone1 ?? null;
    }

    if (pagamento?.telefone2 !== undefined) {
      updatePagamento.telefone2 = pagamento.telefone2;
      createPagamento.telefone2 = pagamento.telefone2 ?? null;
    }

    if (pagamento?.telefone3 !== undefined) {
      updatePagamento.telefone3 = pagamento.telefone3;
      createPagamento.telefone3 = pagamento.telefone3 ?? null;
    }

    if (pagamento?.email1 !== undefined) {
      updatePagamento.email1 = pagamento.email1;
      createPagamento.email1 = pagamento.email1 ?? null;
    }

    if (pagamento?.email2 !== undefined) {
      updatePagamento.email2 = pagamento.email2;
      createPagamento.email2 = pagamento.email2 ?? null;
    }

    if (pagamento?.email3 !== undefined) {
      updatePagamento.email3 = pagamento.email3;
      createPagamento.email3 = pagamento.email3 ?? null;
    }

    if (pagamento?.sistemaPagamento !== undefined) {
      updatePagamento.sistemaPagamento = pagamento.sistemaPagamento;
    }

    if (pagamento?.numeroProcesso !== undefined) {
      updatePagamento.numeroProcesso = pagamento.numeroProcesso;
      createPagamento.numeroProcesso = pagamento.numeroProcesso ?? null;
    }

    if (pagamento?.nomeAdvogado !== undefined) {
      updatePagamento.nomeAdvogado = pagamento.nomeAdvogado;
      createPagamento.nomeAdvogado = pagamento.nomeAdvogado ?? null;
    }

    if (pagamento?.telefoneAdvogado1 !== undefined) {
      updatePagamento.telefoneAdvogado1 = pagamento.telefoneAdvogado1;
      createPagamento.telefoneAdvogado1 = pagamento.telefoneAdvogado1 ?? null;
    }

    if (pagamento?.telefoneAdvogado2 !== undefined) {
      updatePagamento.telefoneAdvogado2 = pagamento.telefoneAdvogado2;
      createPagamento.telefoneAdvogado2 = pagamento.telefoneAdvogado2 ?? null;
    }

    if (pagamento?.telefoneAdvogado3 !== undefined) {
      updatePagamento.telefoneAdvogado3 = pagamento.telefoneAdvogado3;
      createPagamento.telefoneAdvogado3 = pagamento.telefoneAdvogado3 ?? null;
    }

    if (pagamento?.emailAdvogado1 !== undefined) {
      updatePagamento.emailAdvogado1 = pagamento.emailAdvogado1;
      createPagamento.emailAdvogado1 = pagamento.emailAdvogado1 ?? null;
    }

    if (pagamento?.emailAdvogado2 !== undefined) {
      updatePagamento.emailAdvogado2 = pagamento.emailAdvogado2;
      createPagamento.emailAdvogado2 = pagamento.emailAdvogado2 ?? null;
    }

    if (pagamento?.emailAdvogado3 !== undefined) {
      updatePagamento.emailAdvogado3 = pagamento.emailAdvogado3;
      createPagamento.emailAdvogado3 = pagamento.emailAdvogado3 ?? null;
    }

    if (pagamento?.houveNegociacao !== undefined) {
      updatePagamento.houveNegociacao = pagamento.houveNegociacao;
      createPagamento.houveNegociacao = pagamento.houveNegociacao ?? null;
    }

    if (pagamento?.valorAcordado !== undefined) {
      updatePagamento.valorAcordado = pagamento.valorAcordado;
      createPagamento.valorAcordado = pagamento.valorAcordado ?? null;
    }

    if (Object.keys(updatePagamento).length > 0 || existing.dadosPagamento) {
      if (existing.dadosPagamento) {
        if (Object.keys(updatePagamento).length > 0) {
          data.dadosPagamento = { update: updatePagamento };
        }
      } else {
        data.dadosPagamento = { create: createPagamento };
      }
    }
  }

  if (dto.dadosEscola !== undefined) {
    const escola = dto.dadosEscola;
    const updateEscola: Record<string, unknown> = {};
    const createEscola: Record<string, unknown> = {
      tipoEscola:
        escola?.tipoEscola ?? existing.dadosEscola?.tipoEscola ?? (() => {
          throw new AppError('TIPO_ESCOLA_OBRIGATORIO', 'Tipo de escola é obrigatório', 400);
        })(),
    };

    if (escola?.nome !== undefined) {
      updateEscola.nome = escola.nome;
      createEscola.nome = escola.nome ?? null;
    }

    if (escola?.telefone !== undefined) {
      updateEscola.telefone = escola.telefone;
      createEscola.telefone = escola.telefone ?? null;
    }

    if (escola?.email !== undefined) {
      updateEscola.email = escola.email;
      createEscola.email = escola.email ?? null;
    }

    if (escola?.endereco !== undefined) {
      if (escola.endereco) {
        updateEscola.endereco = {
          connectOrCreate: {
            where: {
              unique_endereco: {
                cep: escola.endereco.cep ?? '',
                rua: escola.endereco.logradouro ?? '',
                numero: escola.endereco.numero ?? '',
                bairro: escola.endereco.bairro ?? '',
                cidade: escola.endereco.cidade ?? '',
                uf: escola.endereco.uf ?? '',
                complemento: escola.endereco.complemento ?? '',
              },
            },
            create: {
              cep: escola.endereco.cep ?? null,
              rua: escola.endereco.logradouro ?? null,
              numero: escola.endereco.numero ?? null,
              bairro: escola.endereco.bairro ?? null,
              cidade: escola.endereco.cidade ?? null,
              uf: escola.endereco.uf ?? null,
              complemento: escola.endereco.complemento ?? null,
            },
          },
        };

        createEscola.endereco = {
          connectOrCreate: {
            where: {
              unique_endereco: {
                cep: escola.endereco.cep ?? '',
                rua: escola.endereco.logradouro ?? '',
                numero: escola.endereco.numero ?? '',
                bairro: escola.endereco.bairro ?? '',
                cidade: escola.endereco.cidade ?? '',
                uf: escola.endereco.uf ?? '',
                complemento: escola.endereco.complemento ?? '',
              },
            },
            create: {
              cep: escola.endereco.cep ?? null,
              rua: escola.endereco.logradouro ?? null,
              numero: escola.endereco.numero ?? null,
              bairro: escola.endereco.bairro ?? null,
              cidade: escola.endereco.cidade ?? null,
              uf: escola.endereco.uf ?? null,
              complemento: escola.endereco.complemento ?? null,
            },
          },
        };
      } else {
        updateEscola.endereco = { disconnect: true };
      }
    }

    if (escola?.contatos !== undefined) {
      updateEscola.contatos = {
        deleteMany: {},
        create: (escola.contatos ?? []).map((contato) => ({
          nome: contato?.nome ?? null,
          telefone: contato?.telefone ?? null,
          email: contato?.email ?? null,
          funcao: contato?.funcao ?? null,
        })),
      };

      createEscola.contatos = {
        create: (escola.contatos ?? []).map((contato) => ({
          nome: contato?.nome ?? null,
          telefone: contato?.telefone ?? null,
          email: contato?.email ?? null,
          funcao: contato?.funcao ?? null,
        })),
      };
    }

    if (Object.keys(updateEscola).length > 0 || existing.dadosEscola) {
      if (existing.dadosEscola) {
        if (Object.keys(updateEscola).length > 0) {
          data.dadosEscola = { update: updateEscola };
        }
      } else {
        data.dadosEscola = { create: createEscola };
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return getById(id);
  }

  await prisma.cliente.update({
    where: { id },
    data,
  });

  return getById(id);
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