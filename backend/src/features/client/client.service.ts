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

async function UpdateMainData(clientId: string, dadosPrincipais?: Partial<ClientType.UpdateClient>) {
  if (dadosPrincipais) {
    await prisma.cliente.update({
      where: { id: clientId },
      data: {
        ...(dadosPrincipais.nome !== undefined && { nome: dadosPrincipais.nome }),
        ...(dadosPrincipais.cpf !== undefined && { cpf: dadosPrincipais.cpf }),
        ...(dadosPrincipais.dataNascimento !== undefined && { dataNascimento: new Date(dadosPrincipais.dataNascimento) }),
        ...(dadosPrincipais.emailContato !== undefined && { emailContato: dadosPrincipais.emailContato }),
        ...(dadosPrincipais.dataEntrada !== undefined && { dataEntrada: new Date(dadosPrincipais.dataEntrada) }),
        ...(dadosPrincipais.dataSaida !== undefined && { dataSaida: dadosPrincipais.dataSaida ? new Date(dadosPrincipais.dataSaida) : null }),
      }
    })
  }
}

async function UpdateCaregiver(clientId: string, cuidadores?: Partial<ClientType.UpdateCaregiver[]>) {
  if (Array.isArray(cuidadores)) {
    const current = await prisma.cuidador.findMany({
      where: { clienteId: clientId },
      select: { cpf: true, enderecoId: true },
    });
  
    const currentCpfs = new Set(current.map(c => c.cpf));
    const incomingCpfs = new Set<string>(
      (cuidadores ?? []).flatMap(c => (c?.cpf ? [c.cpf] : []))
    );
  
    const toDelete = [...currentCpfs].filter(cpf => !incomingCpfs.has(cpf));
    const toUpsert = cuidadores;
  
    await prisma.$transaction(async (tx) => {
      for (const c of toUpsert) {
        if (!c?.cpf) {
          throw new AppError('CPF_MANDATORY', 'CPF do cuidador é obrigatório.', 422);
        }
  
        const e: Partial<ClientType.UpdateAddress> = c.endereco ?? {}
  
        const enderecoUpdate = {
        ...(e.cep !== undefined && { cep: e.cep }),
        ...(e.logradouro !== undefined && { rua: e.logradouro }),
        ...(e.numero !== undefined && { numero: e.numero }),
        ...(e.complemento !== undefined && { complemento: e.complemento }),
        ...(e.bairro !== undefined && { bairro: e.bairro }),
        ...(e.cidade !== undefined && { cidade: e.cidade }),
        ...(e.uf !== undefined && { uf: e.uf }),
        };
  
        const enderecoCreate = {
          ...(e.cep !== undefined && { cep: e.cep }),
          ...(e.logradouro !== undefined && { rua: e.logradouro }),
          ...(e.numero !== undefined && { numero: e.numero }),
          ...(e.complemento !== undefined && { complemento: e.complemento }),
          ...(e.bairro !== undefined && { bairro: e.bairro }),
          ...(e.cidade !== undefined && { cidade: e.cidade }),
          ...(e.uf !== undefined && { uf: e.uf }),
        };
  
        await tx.cuidador.upsert({
          where: { cpf: c.cpf },
          create: {
            cliente: { connect: { id: clientId } },
            relacao: c.relacao ?? null,
            descricaoRelacao: c.descricaoRelacao ?? null,
            nome: c.nome,
            cpf: c.cpf,
            profissao: c.profissao ?? null,
            escolaridade: c.escolaridade ?? null,
            telefone: c.telefone ?? null,
            email: c.email ?? null,
            endereco: { create: enderecoCreate },
          },
          update: {
            cliente: { connect: { id: clientId } },
            relacao: c.relacao ?? undefined,
            descricaoRelacao: c.descricaoRelacao ?? null,
            nome: c.nome ?? undefined,
            profissao: c.profissao ?? undefined,
            escolaridade: c.escolaridade ?? undefined,
            telefone: c.telefone ?? undefined,
            email: c.email ?? undefined,
            endereco: {
              upsert: {
                create: enderecoCreate,
                update: enderecoUpdate,
              },
            },
          },
        });
      }
  
      if (toDelete.length > 0) {
        const clientAddress = await tx.cliente_endereco.findFirst({
          where: { clienteId: clientId },
          select: { enderecoId: true },
        });
  
        const addressesFromDeletes = await tx.cuidador.findMany({
          where: { clienteId: clientId, cpf: { in: toDelete } },
          select: { enderecoId: true },
        });
  
        const fallbackCaregiver = await tx.cuidador.findFirst({
          where: { clienteId: clientId, cpf: { notIn: toDelete } },
          select: { enderecoId: true },
        });
  
        const deletingIds = new Set(
          addressesFromDeletes
            .map(a => a.enderecoId)
            .filter((id): id is number => id !== null)
        );
  
        if (
          clientAddress?.enderecoId !== undefined &&
          deletingIds.has(clientAddress.enderecoId)
        ) {
          if (!fallbackCaregiver?.enderecoId) {
            throw new AppError(
              'CAREGIVER_ADDRESS_REQUIRED',
              'Cliente deve ter ao menos 1 endereço de um cuidador responsável.',
              400
            );
          }
  
          await tx.cliente_endereco.updateMany({
            where: { clienteId: clientId, enderecoId: clientAddress.enderecoId },
            data: { enderecoId: fallbackCaregiver.enderecoId },
          });
        }
  
        // apaga cuidadores
        await tx.cuidador.deleteMany({
          where: { clienteId: clientId, cpf: { in: toDelete } },
        });
  
        // limpa endereços realmente órfãos (se seu schema permitir filtros relacionais, prefira)
        const candidateIds = [...deletingIds];
        if (candidateIds.length > 0) {
          await tx.endereco.deleteMany({
            where: { id: { in: candidateIds } },
          });
        }
      }
    });
  }
}

async function UpdateAddress(clientId: string, enderecos?: Partial<ClientType.UpdateAddress[]>) {
  const enderecoId = await prisma.cliente_endereco.findFirst({
    where: { clienteId: clientId },
    select: { enderecoId: true },
  });

  if (enderecoId) {
    await prisma.endereco.update({
      where: { id: enderecoId?.enderecoId },
      data: {
        ...(enderecos?.[0]?.cep !== undefined && { cep: enderecos?.[0]?.cep }),
        ...(enderecos?.[0]?.logradouro !== undefined && { rua: enderecos?.[0]?.logradouro }),
        ...(enderecos?.[0]?.numero !== undefined && { numero: enderecos?.[0]?.numero }),
        ...(enderecos?.[0]?.complemento !== undefined && { complemento: enderecos?.[0]?.complemento }),
        ...(enderecos?.[0]?.bairro !== undefined && { bairro: enderecos?.[0]?.bairro }),
        ...(enderecos?.[0]?.cidade !== undefined && { cidade: enderecos?.[0]?.cidade }),
        ...(enderecos?.[0]?.uf !== undefined && { uf: enderecos?.[0]?.uf }),
      }
    })
  }
}

async function UpdateDataPayment(clientId: string, dadosPagamento?: Partial<ClientType.UpdateDataPayment>) {
  await prisma.dados_pagamento.update({
    where: { clienteId: clientId },
    data: {
      ...(dadosPagamento?.nomeTitular !== undefined && { nomeTitular: dadosPagamento.nomeTitular }),
      ...(dadosPagamento?.numeroCarteirinha !== undefined && { numeroCarteirinha: dadosPagamento.numeroCarteirinha }),
      ...(dadosPagamento?.telefone1 !== undefined && { telefone1: dadosPagamento.telefone1 }),
      ...(dadosPagamento?.telefone2 !== undefined && { telefone2: dadosPagamento.telefone2 }),
      ...(dadosPagamento?.telefone3 !== undefined && { telefone3: dadosPagamento.telefone3 }),
      ...(dadosPagamento?.email1 !== undefined && { email1: dadosPagamento.email1 }),
      ...(dadosPagamento?.email2 !== undefined && { email2: dadosPagamento.email2 }),
      ...(dadosPagamento?.email3 !== undefined && { email3: dadosPagamento.email3 }),
      ...(dadosPagamento?.sistemaPagamento !== undefined && { sistemaPagamento: dadosPagamento.sistemaPagamento }),
      ...(dadosPagamento?.numeroProcesso !== undefined && { numeroProcesso: dadosPagamento.numeroProcesso }),
      ...(dadosPagamento?.nomeAdvogado !== undefined && { nomeAdvogado: dadosPagamento.nomeAdvogado }),
      ...(dadosPagamento?.telefoneAdvogado1 !== undefined && { telefoneAdvogado1: dadosPagamento.telefoneAdvogado1 }),
      ...(dadosPagamento?.telefoneAdvogado2 !== undefined && { telefoneAdvogado2: dadosPagamento.telefoneAdvogado2 }),
      ...(dadosPagamento?.telefoneAdvogado3 !== undefined && { telefoneAdvogado3: dadosPagamento.telefoneAdvogado3 }),
      ...(dadosPagamento?.emailAdvogado1 !== undefined && { emailAdvogado1: dadosPagamento.emailAdvogado1 }),
      ...(dadosPagamento?.emailAdvogado2 !== undefined && { emailAdvogado2: dadosPagamento.emailAdvogado2 }),
      ...(dadosPagamento?.emailAdvogado3 !== undefined && { emailAdvogado3: dadosPagamento.emailAdvogado3 }),
      ...(dadosPagamento?.houveNegociacao !== undefined && { houveNegociacao: dadosPagamento.houveNegociacao }),
      ...(dadosPagamento?.valorAcordado !== undefined && { valorAcordado: dadosPagamento.valorAcordado }),
    },
  })
}

async function UpdateDataSchool(clientId: string, dadosEscola?: Partial<ClientType.UpdateDataSchool>) {
  const escola = await prisma.dados_escola.update({
    where: { clienteId: clientId },
    data: {
      ...(dadosEscola?.tipoEscola !== undefined && { tipoEscola: dadosEscola.tipoEscola }),
      ...(dadosEscola?.nome !== undefined && { nome: dadosEscola.nome }),
      ...(dadosEscola?.telefone !== undefined && { telefone: dadosEscola.telefone }),
      ...(dadosEscola?.email !== undefined && { email: dadosEscola.email }),

      ...(dadosEscola?.endereco !== undefined && {
        endereco: {
          upsert: {
            update: {
              ...(dadosEscola.endereco.cep !== undefined && { cep: dadosEscola.endereco.cep }),
              ...(dadosEscola.endereco.logradouro !== undefined && { rua: dadosEscola.endereco.logradouro }),
              ...(dadosEscola.endereco.numero !== undefined && { numero: dadosEscola.endereco.numero }),
              ...(dadosEscola.endereco.complemento !== undefined && { complemento: dadosEscola.endereco.complemento }),
              ...(dadosEscola.endereco.bairro !== undefined && { bairro: dadosEscola.endereco.bairro }),
              ...(dadosEscola.endereco.cidade !== undefined && { cidade: dadosEscola.endereco.cidade }),
              ...(dadosEscola.endereco.uf !== undefined && { uf: dadosEscola.endereco.uf }),
            },
            create: {
              ...(dadosEscola.endereco.cep !== undefined && { cep: dadosEscola.endereco.cep }),
              ...(dadosEscola.endereco.logradouro !== undefined && { rua: dadosEscola.endereco.logradouro }),
              ...(dadosEscola.endereco.numero !== undefined && { numero: dadosEscola.endereco.numero }),
              ...(dadosEscola.endereco.complemento !== undefined && { complemento: dadosEscola.endereco.complemento }),
              ...(dadosEscola.endereco.bairro !== undefined && { bairro: dadosEscola.endereco.bairro }),
              ...(dadosEscola.endereco.cidade !== undefined && { cidade: dadosEscola.endereco.cidade }),
              ...(dadosEscola.endereco.uf !== undefined && { uf: dadosEscola.endereco.uf }),
            },
          },
        },
      }),
    },
    select: { id: true },
  });

  const contato0 = dadosEscola?.contatos?.[0];

  if (contato0) {
    // pega o primeiro contato existente da escola
    const contatoExistente = await prisma.escola_contato.findFirst({
      where: { dadosEscolaId: escola.id },
      orderBy: { id: 'asc' },
      select: { id: true },
    });

    if (contatoExistente) {
      // atualiza só o primeiro
      await prisma.escola_contato.update({
        where: { id: contatoExistente.id },
        data: {
          ...(contato0.nome !== undefined && { nome: contato0.nome }),
          ...(contato0.telefone !== undefined && { telefone: contato0.telefone }),
          ...(contato0.email !== undefined && { email: contato0.email }),
        },
      });
    } else {
      await prisma.escola_contato.create({
        data: {
          dadosEscolaId: escola.id,
          nome: contato0.nome ?? null,
          telefone: contato0.telefone ?? null,
          email: contato0.email ?? null,
        },
      });
    }
  } 
}

export async function update(id: string, dto: Partial<ClientType.UpdateClient>) {
  const {
    cuidadores,
    enderecos,
    dadosPagamento,
    dadosEscola,
    ...dadosPrincipais
  } = dto;

  const clientId = id;

  const existing = await prisma.cliente.findUnique({ where: { id: clientId } });
  if (!existing) {
    throw new AppError('CLIENT_NOT_FOUND', 'Cliente não encontrado.', 404);
  }

  await UpdateMainData(clientId, dadosPrincipais);
  await UpdateCaregiver(clientId, cuidadores);
  await UpdateAddress(clientId, enderecos);
  await UpdateDataPayment(clientId, dadosPagamento);
  await UpdateDataSchool(clientId, dadosEscola);

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