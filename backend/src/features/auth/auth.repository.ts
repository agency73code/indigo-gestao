import { prisma } from "../../config/database.js";
import { hashPassword } from "../../utils/hash.util.js";
import type { Tables, UserRow } from "./auth.types.js";

export async function findUserByEmail(email: string, table: Tables) {
  if (table === 'terapeuta') {
    const row = await prisma.terapeuta.findFirst({ where: { email_indigo: email } });
    if (!row) return null;
    return { id: row.id, nome: row.nome, email: row.email_indigo, table: 'terapeuta' as const };
  } else {
    const row = await prisma.cliente.findUnique({ where: { emailContato: email } });
    if (!row) return null;
    return { id: row.id, nome: row.nome, email: row.emailContato, table: 'cliente' as const };
  }
}

export async function passwordResetToken(userId: string, token: string, expiresAt: Date, table: Tables) {
  let result;

  if (table === 'terapeuta') {
    result = prisma.terapeuta.update({
      where: { id: userId },
      data: {
        token_redefinicao: token,
        validade_token: expiresAt,
      },
    });
  } else {
    result = prisma.cliente.update({
      where: { id: userId },
      data: {
        token_redefinicao: token,
        validade_token: expiresAt,
      },
    });
  }

  return result;
}

export async function findUserByResetToken(token: string, table: Tables) {
  const where = {
    token_redefinicao: token,
    validade_token: { gte: new Date() },
  };

  if (table === 'terapeuta') {
    return prisma.terapeuta.findFirst({
      where,
      select: { nome: true, email: true },
    });
  } else {
    return prisma.cliente.findFirst({
      where,
      select: { nome: true, emailContato: true },
    });
  }
}

export async function loginUserByAccessInformation(accessInfo: string, table: Tables): Promise<UserRow | null> {
  if (table === 'terapeuta') {
    const row = await prisma.terapeuta.findFirst({
      where: {
        email_indigo: accessInfo
      },
      select: {
        id: true,
        senha: true,
        nome: true,
        email_indigo: true,
        perfil_acesso: true,
        arquivos: {
          where: { tipo: 'fotoPerfil' },
          select: { arquivo_id: true },
          take: 1,
        },
      },
    });

    if (!row) return null;
    return {
      id: row.id,
      senha: row.senha,
      nome: row.nome,
      email: row.email_indigo ?? null,
      perfil_acesso: row.perfil_acesso,
      avatar_url: row.arquivos[0] 
        ? `${process.env.API_URL}/api/arquivos/${encodeURIComponent(row.arquivos[0].arquivo_id!)}/view/` 
        : null,
    };
  } else {
    const row = await prisma.cliente.findFirst({
      where: {
        OR: [
            { emailContato: accessInfo },
            {
              cuidadores: {
                some: { cpf: accessInfo }
              },
            },
        ],
       },
      select: {
        id: true,
        senha: true,
        nome: true,
        emailContato: true,
        perfil_acesso: true,
        arquivos: {
          where: { tipo: 'fotoPerfil' },
          select: { arquivo_id: true },
          take: 1,
        },
      },
    });

    if (!row) return null;
    return {
      id: row.id,
      senha: row.senha,
      nome: row.nome!,
      email: row.emailContato ?? null,
      perfil_acesso: row.perfil_acesso!,
      avatar_url: row.arquivos[0] 
        ? `${process.env.API_URL}/api/arquivos/${encodeURIComponent(row.arquivos[0].arquivo_id!)}/view/` 
        : null,
    };
  }
}

export async function newPassword(token: string, password: string, table: Tables) {
  const where = { token_redefinicao: token, validade_token: { gte: new Date() } };
  const data = {
    senha: await hashPassword(password),
    token_redefinicao: null,
    validade_token: null,
  };

  if (table === 'terapeuta') {
    return prisma.terapeuta.updateMany({ where, data, });
  } else {
    return prisma.cliente.updateMany({ where, data, });
  }
}

export async function findUserById(id: string, table: Tables) {
  if (table === 'terapeuta') {
    const row = await prisma.terapeuta.findUnique({
      where: { id },
      select: { 
        id: true,
        nome: true,
        email_indigo: true,
        perfil_acesso: true,
        arquivos: { 
          where: { tipo: 'fotoPerfil' }, 
          select: { arquivo_id: true },
          take: 1,
        },
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      nome: row.nome,
      email: row.email_indigo,
      perfil_acesso: row.perfil_acesso,
      avatar_url: row.arquivos[0] 
        ? `${process.env.API_URL}/api/arquivos/${encodeURIComponent(row.arquivos[0].arquivo_id!)}/view` 
        : null,
    };
  } else {
    const row = await prisma.cliente.findUnique({
      where: { id },
      select: { 
        id: true, 
        nome: true, 
        emailContato: true, 
        perfil_acesso: true,
        arquivos: { 
          where: { 
            tipo: 'fotoPerfil' 
          }, 
          select: { arquivo_id: true },
          take: 1,
        },
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      nome:row.nome,
      email: row.emailContato,
      perfil_acesso: row.perfil_acesso,
      avatar_url: row.arquivos[0] 
        ? `${process.env.API_URL}/api/arquivos/${encodeURIComponent(row.arquivos[0].arquivo_id!)}/view` 
        : null,
    }
  }
}