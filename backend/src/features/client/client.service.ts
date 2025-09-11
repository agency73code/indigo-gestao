import { prisma } from "../../config/database.js";
import { createCliente } from "./client.mapper.js";
import { normalizer, type FrontCliente } from "./client.normalizer.js";

export async function getById(id: string) {
  const client = await prisma.cliente.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      data_nascimento: true,
      email_contato: true,
      data_entrada: true,
      data_saida: true,
      cliente_responsavel: {
        orderBy: { prioridade: "asc" },
        select: {
          prioridade: true,
          parentesco: true,
          responsaveis: {
            select: { nome: true, cpf: true, telefone: true },
          },
        },
      },
      cliente_endereco: {
        select: {
          principal: true,
          endereco: {
            select: {
              cep: true,
              logradouro: true,
              numero: true,
              complemento: true,
              bairro: true,
              cidade: true,
              uf: true,
            },
          },
        },
      },
      pagamentos: {
        take: 1,
        select: {
          nome: true,
          numero_carteirinha: true,
          tipo_sistema: true,
          prazo_reembolso_dias: true,
          numero_processo: true,
          nome_advogado: true,
          valor_sessao: true,
          pagamento_contatos: {
            select: { categoria: true, tipo: true, valor: true },
          },
        },
      },
      cliente_escola: {
        take: 1,
        select: {
          escola: {
            select: {
              tipo_escola: true,
              nome: true,
              telefone: true,
              email: true,
              escola_endereco: {
                take: 1,
                select: {
                  endereco: {
                    select: {
                      cep: true,
                      logradouro: true,
                      numero: true,
                      complemento: true,
                      bairro: true,
                      cidade: true,
                      uf: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!client) return null;

  const responsaveisOrdenados = client.cliente_responsavel.sort(
    (a, b) => a.prioridade - b.prioridade,
  );
  const mae = responsaveisOrdenados.find((r) => r.parentesco === "mae");
  const pais = responsaveisOrdenados.filter((r) => r.parentesco === "pai");
  const pai = pais[0];
  const pai2 = pais[1];

  const enderecos = client.cliente_endereco.map((e) => ({
    cep: e.endereco.cep,
    logradouro: e.endereco.logradouro,
    numero: e.endereco.numero,
    complemento: e.endereco.complemento ?? undefined,
    bairro: e.endereco.bairro,
    cidade: e.endereco.cidade,
    uf: e.endereco.uf,
  }));

  const pagamento = client.pagamentos[0];
  const contatosGerais =
    pagamento?.pagamento_contatos.filter((c) => c.categoria === "geral") ?? [];
  const contatosAdv =
    pagamento?.pagamento_contatos.filter((c) => c.categoria === "advogado") ?? [];

  const telsGerais = contatosGerais
    .filter((c) => c.tipo === "telefone")
    .map((c) => c.valor);
  const emailsGerais = contatosGerais
    .filter((c) => c.tipo === "email")
    .map((c) => c.valor);

  const telsAdv = contatosAdv.filter((c) => c.tipo === "telefone").map((c) => c.valor);
  const emailsAdv = contatosAdv.filter((c) => c.tipo === "email").map((c) => c.valor);

  const dadosPagamento = pagamento
    ? {
        nomeTitular: pagamento.nome ?? "",
        numeroCarteirinha: pagamento.numero_carteirinha ?? undefined,
        telefone1: telsGerais[0] ?? "",
        mostrarTelefone2: !!telsGerais[1],
        telefone2: telsGerais[1],
        mostrarTelefone3: !!telsGerais[2],
        telefone3: telsGerais[2],
        email1: emailsGerais[0] ?? "",
        mostrarEmail2: !!emailsGerais[1],
        email2: emailsGerais[1],
        mostrarEmail3: !!emailsGerais[2],
        email3: emailsGerais[2],
        sistemaPagamento: pagamento.tipo_sistema,
        prazoReembolso:
          pagamento.tipo_sistema === "reembolso"
            ? pagamento.prazo_reembolso_dias?.toString()
            : undefined,
        numeroProcesso:
          pagamento.tipo_sistema === "liminar"
            ? pagamento.numero_processo ?? undefined
            : undefined,
        nomeAdvogado:
          pagamento.tipo_sistema === "liminar"
            ? pagamento.nome_advogado ?? undefined
            : undefined,
        telefoneAdvogado1: telsAdv[0],
        mostrarTelefoneAdvogado2: !!telsAdv[1],
        telefoneAdvogado2: telsAdv[1],
        mostrarTelefoneAdvogado3: !!telsAdv[2],
        telefoneAdvogado3: telsAdv[2],
        emailAdvogado1: emailsAdv[0],
        mostrarEmailAdvogado2: !!emailsAdv[1],
        emailAdvogado2: emailsAdv[1],
        mostrarEmailAdvogado3: !!emailsAdv[2],
        emailAdvogado3: emailsAdv[2],
        houveNegociacao:
          pagamento.tipo_sistema === "particular" ? "nao" : undefined,
        valorSessao: pagamento.valor_sessao
          ? pagamento.valor_sessao.toString()
          : undefined,
      }
    : undefined;

  const escola = client.cliente_escola[0]?.escola;
  const escolaEnd = escola?.escola_endereco[0];
  const dadosEscola = escola
    ? {
        tipoEscola: escola.tipo_escola,
        nome: escola.nome,
        telefone: escola.telefone,
        email: escola.email ?? undefined,
        endereco: escolaEnd
          ? {
              cep: escolaEnd.endereco.cep,
              logradouro: escolaEnd.endereco.logradouro,
              numero: escolaEnd.endereco.numero,
              complemento: escolaEnd.endereco.complemento ?? undefined,
              bairro: escolaEnd.endereco.bairro,
              cidade: escolaEnd.endereco.cidade,
              uf: escolaEnd.endereco.uf,
            }
          : {},
      }
    : undefined;

  return {
    id: client.id,
    nome: client.nome,
    dataNascimento: client.data_nascimento.toISOString(),
    nomeMae: mae?.responsaveis.nome ?? "",
    cpfMae: mae?.responsaveis.cpf ?? "",
    nomePai: pai?.responsaveis.nome ?? undefined,
    cpfPai: pai?.responsaveis.cpf ?? undefined,
    telefonePai: pai?.responsaveis.telefone ?? undefined,
    emailContato: client.email_contato,
    dataEntrada: client.data_entrada.toISOString(),
    dataSaida: client.data_saida?.toISOString(),
    maisDeUmPai: pai2 ? "sim" : "nao",
    nomePai2: pai2?.responsaveis.nome ?? undefined,
    cpfPai2: pai2?.responsaveis.cpf ?? undefined,
    telefonePai2: pai2?.responsaveis.telefone ?? undefined,
    enderecos,
    maisDeUmEndereco: enderecos.length > 1 ? "sim" : "nao",
    dadosPagamento,
    dadosEscola,
  };
}

export async function list() {
  const clients = await prisma.cliente.findMany({
    select: {
      id: true,
      nome: true,
      email_contato: true,
      status: true,
      cliente_responsavel: {
        orderBy: { prioridade: "asc" },
        take: 1,
        select: {
          responsaveis: { select: { nome: true, telefone: true } },
        },
      },
      pagamentos: {
        take: 1,
        select: {
          pagamento_contatos: {
            select: { tipo: true, valor: true, categoria: true },
          },
        },
      },
    },
  });

  return clients.map((c) => {
    const resp = c.cliente_responsavel[0];
    const contatos =
      c.pagamentos[0]?.pagamento_contatos.filter(
        (p) => p.categoria === "geral" && p.tipo === "telefone",
      ) ?? [];
    const telefone = contatos[0]?.valor ?? resp?.responsaveis.telefone ?? undefined;

    return {
      id: c.id,
      nome: c.nome,
      email: c.email_contato ?? undefined,
      telefone,
      responsavel: resp?.responsaveis.nome ?? undefined,
      status: c.status === "ativo" ? "ATIVO" : "INATIVO",
    };
  });
}

export async function create(data: FrontCliente) {
  const normalized = await normalizer(data);
  return createCliente(prisma, normalized);
}