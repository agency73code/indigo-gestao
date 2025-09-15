import type { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import type { Terapeuta } from "./therapist.types.js";
import { CARGO_MAP } from './therapist.types.js'

function generateResetToken() {
    const token = uuidv4();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    return { token, expiry };
}

export async function createTherapistBase(prisma: PrismaClient, data: Terapeuta) {
  const id = uuidv4();
  const { token, expiry } = generateResetToken();

  const hasGerente = data.terapeuta_cargo.some(
    (c) => c.cargo_id === CARGO_MAP['Gerente']
  );

  return prisma.$transaction(async (tx) => {
    const therapist = await tx.terapeuta.create({
      data: {
        id,
        nome: data.nome,
        cpf: data.cpf,
        data_nascimento: data.data_nascimento,
        telefone: data.telefone,
        celular: data.celular,
        foto_perfil: data.foto_perfil,
        email: data.email,
        email_indigo: data.email_indigo,
        possui_veiculo: data.possui_veiculo,
        placa_veiculo: data.placa_veiculo,
        modelo_veiculo: data.modelo_veiculo,
        banco: data.banco,
        agencia: data.agencia,
        conta: data.conta,
        chave_pix: data.chave_pix,
        cnpj_empresa: data.cnpj_empresa,
        razao_social: data.razao_social,
        graduacao: data.graduacao,
        grad_instituicao: data.grad_instituicao,
        ano_formatura: data.ano_formatura,
        pos_graduacao: data.pos_graduacao,
        pos_grad_instituicao: data.pos_grad_instituicao,
        ano_pos_graduacao: data.ano_pos_graduacao,
        cursos: data.cursos,
        data_entrada: data.data_entrada,
        data_saida: data.data_saida,
        perfil_acesso: hasGerente ? 'gerente' : data.perfil_acesso,
        atividade: data.atividade,
        senha: null,
        token_redefinicao: token,
        validade_token: expiry,
      },
    });

    if (data.terapeuta_area_atuacao.length) {
      await tx.terapeuta_area_atuacao.createMany({
        data: data.terapeuta_area_atuacao.map((a) => ({
          terapeuta_id: id,
          area_atuacao_id: a.area_atuacao_id,
        })),
      });
    }

    if (data.terapeuta_cargo.length) {
      await tx.terapeuta_cargo.createMany({
        data: data.terapeuta_cargo.map((c) => ({
          terapeuta_id: id,
          cargo_id: c.cargo_id,
          numero_conselho: c.numero_conselho,
          data_entrada: c.data_entrada,
          data_saida: c.data_saida,
        })),
      });
    }

    for (const end of data.terapeuta_endereco) {
      const endereco = await tx.endereco.create({
        data: {
          cep: end.endereco.cep,
          logradouro: end.endereco.logradouro,
          numero: end.endereco.numero,
          bairro: end.endereco.bairro,
          cidade: end.endereco.cidade,
          uf: end.endereco.uf,
          complemento: end.endereco.complemento,
        },
      });

      await tx.terapeuta_endereco.create({
        data: {
          terapeuta_id: id,
          endereco_id: endereco.id,
          tipo_endereco_id: end.tipo_endereco_id,
          principal: end.principal,
        },
      });
    }

    return therapist;
  });
}