import { 
  PrismaClient,
  escola_tipo_escola,
  cliente_responsavel_parentesco,
  pagamentos_tipo_sistema,
  pagamento_contatos_categoria,
  pagamento_contatos_tipo,
} from "@prisma/client";
import type { ClientCreateData } from "./client.types.js";
import { v4 as uuidv4 } from "uuid";

function toEnum<T extends Record<string, string>>(e: T, value: string, field: string): T[keyof T] {
  const v = String(value ?? "").trim();
  const match = Object.values(e).find(opt => opt.toLowerCase() === v.toLowerCase());
  if (!match) {
    throw new Error(`Valor inválido para ${field}: "${value}". Opções válidas: ${Object.values(e).join(", ")}`);
  }
  return match as T[keyof T];
}

function asDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  const s = input.trim();
  return s.length === 10 ? new Date(`${s}T00:00:00`) : new Date(s);
}

export function mapClientBase(input: ClientCreateData) {
  return {
    id: uuidv4(),
    nome: input.nome,
    data_nascimento: asDate(input.data_nascimento),
    email_contato: input.email_contato,
    data_entrada: asDate(input.data_entrada),
    perfil_acesso: input.perfil_acesso,
  };
}

export async function createCliente(prisma: PrismaClient, data: ClientCreateData) {
  const base = mapClientBase(data);

  try {
    const cliente = await prisma.$transaction(async (tx) => {
      const newCliente = await tx.cliente.create({ data: base });

      if (data.enderecos && data.enderecos.length > 0) {
        for (const enderecoData of data.enderecos) {
          const endereco = await tx.endereco.create({
            data: {
              cep: enderecoData.cep,
              logradouro: enderecoData.logradouro,
              numero: enderecoData.numero,
              bairro: enderecoData.bairro,
              cidade: enderecoData.cidade,
              uf: enderecoData.uf,
              complemento: enderecoData.complemento || null,
            },
          });

          await tx.cliente_endereco.create({
            data: {
              cliente_id: base.id,
              endereco_id: endereco.id,
              tipo_endereco_id: enderecoData.tipo_endereco_id,
              principal: enderecoData.principal || 0,
            },
          });
        }
      }

      if (data.escolas && data.escolas.length > 0) {
        for (const escolaData of data.escolas) {
          const escola = await tx.escola.create({
            data: {
              tipo_escola: toEnum(escola_tipo_escola, escolaData.tipo_escola, 'tipo_escola'),
              nome: escolaData.nome,
              telefone: escolaData.telefone,
              email: escolaData.email
            },
          });

          await tx.cliente_escola.create({
            data: {
              cliente_id: base.id,
              escola_id: escola.id,
            },
          });

          if (escolaData.enderecos && escolaData.enderecos.length > 0) {
            for (const enderecoData of escolaData.enderecos) {
              const endereco = await tx.endereco.create({
                data: {
                  cep: enderecoData.cep,
                  logradouro: enderecoData.logradouro,
                  numero: enderecoData.numero,
                  bairro: enderecoData.bairro,
                  cidade: enderecoData.cidade,
                  uf: enderecoData.uf,
                  complemento: enderecoData.complemento || null,
                },
              });

              await tx.escola_endereco.create({
                data: {
                  escola_id: escola.id,
                  endereco_id: endereco.id,
                  tipo_endereco_id: enderecoData.tipo_endereco_id,
                  principal: enderecoData.principal || 0,
                }
              })
            }
          }
        }
      }

      if (data.responsaveis && data.responsaveis.length > 0) {
        for (const respData of data.responsaveis) {
          const responsavel = await tx.responsaveis.create({
            data: {
              nome: respData.nome,
              cpf: respData.cpf,
              telefone: respData.telefone || null,
              email: respData.email || null,
            },
          });

          await tx.cliente_responsavel.create({
            data: {
              cliente_id: base.id,
              responsaveis_id: responsavel.id,
              parentesco: toEnum(cliente_responsavel_parentesco, respData.parentesco, 'parentesco'),
              prioridade: respData.prioridade || 1,
            },
          });
        }
      }

      if (data.pagamentos && data.pagamentos.length > 0) {
        for (const pagData of data.pagamentos) {
          const pagamento = await tx.pagamentos.create({
            data: {
              cliente_id: base.id,
              nome: pagData.nome || null,
              numero_carteirinha: pagData.numero_carteirinha || null,
              tipo_sistema: toEnum(pagamentos_tipo_sistema, pagData.tipo_sistema, 'tipo_sistema'),
              prazo_reembolso_dias: pagData.prazo_reembolso_dias || null,
              numero_processo: pagData.numero_processo || null,
              nome_advogado: pagData.nome_advogado || null,
              valor_sessao: pagData.valor_sessao || null,
            },
          });

          if (pagData.pagamento_contatos && pagData.pagamento_contatos.length > 0) {
            await tx.pagamento_contatos.createMany({
              data: pagData.pagamento_contatos.map((contato) => ({
                pagamentos_id: pagamento.id,
                categoria: toEnum(pagamento_contatos_categoria, contato.categoria || 'geral', 'categoria'),
                tipo: toEnum(pagamento_contatos_tipo, contato.tipo, 'tipo'),
                valor: contato.valor,
              })),
            });
          }
        }
      }

      return newCliente;
    });

    return cliente;
  } catch (error: any) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'campo';
      const fieldMap: Record<string, string> = {
        email_contato: 'Email de contato',
        cpf: 'CPF',
      };
      const friendly = fieldMap[field] || field;
      throw new Error(`${friendly} já está em uso.`);
    }
    throw error;
  }
}