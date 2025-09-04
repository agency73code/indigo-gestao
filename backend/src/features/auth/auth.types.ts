export type Tables = 'terapeuta' | 'cliente';

export interface AuthUser {
  id: string | number;
  nome: string;
  email: string | null;
}

export interface UserRow extends AuthUser {
  senha: string | null;
}

export interface ResetTokenData {
  token: string;
  expiresAt: Date;
}