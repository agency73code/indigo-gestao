import type { User } from "@/features/auth/types/auth.types";
import { authFetch } from "./http";
import type { Terapeuta, Cliente } from "@/features/cadastros/types/cadastros.types";
import type { Bank } from '@/common/constants/banks';
import type { Therapist as TerapeutaConsulta, Patient } from '@/features/consultas/types/consultas.types'

const AUTH_BYPASS =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true';

export async function buscarTerapeutaPorId(id: string): Promise<Terapeuta> {
    const res = await authFetch(`/api/terapeutas/${id}`, { method: 'GET' });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = data?.message ?? data?.error ?? `Falha (${res.status})`;
      throw new Error(msg);
    }
    return data as Terapeuta;
}

export async function listarTerapeutas(): Promise<TerapeutaConsulta[]> {
  const res = await authFetch('/api/terapeutas', { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha (${res.status})`;
    throw new Error(msg);
  }
  
  return (data ?? []) as TerapeutaConsulta[];
}

export async function fetchBrazilianBanks(): Promise<Bank[]> {
  const res = await authFetch('/api/terapeutas/bancos', { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha (${res.status})`;
    throw new Error(msg);
  }

  return (data?.data ?? []) as Bank[];
}

export async function listarClientes(): Promise<Patient[]> {
    const res = await authFetch('/api/clientes', { method: 'GET' });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = data?.message ?? data?.error ?? `Falha (${res.status})`;
      throw new Error(msg);
    }

    return (data?.normalized ?? []) as Patient[];
}

export async function buscarClientePorId(id: string): Promise<Cliente> {
  const res = await authFetch(`/api/clientes/${id}`, { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha (${res.status})`;
    throw new Error(msg);
  }

  return data.data as Cliente;
}

export async function cadastrarCliente(payload: Partial<Cliente>) {
  const res = await authFetch('/api/clientes/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  return { ok: res.ok, ...data };
}

export async function cadastrarTerapeuta(payload: Terapeuta) {
  const res = await authFetch('/api/terapeutas/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  return { ok: res.ok, ...data };
}

export async function uploadArquivos(arquivos: Record<string, File | undefined>) {
  const data = new FormData();

  Object.entries(arquivos).forEach(([campo, valor]) => {
    if (valor instanceof File) {
      data.append(campo, valor);
    }
  });

  const res = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/upload`, {
    method: 'POST',
    body: data,
    credentials: 'include',
  });

  if (!res.ok) throw new Error("Falha no upload de arquivos");
  return res.json();
}

export async function validateResetToken(token: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/password-reset/validate/${token}`);
  if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Token inválido ou expirado');
  }

    return res.json();
}

export async function resetPassword(token: string, password: string, confirmPassword: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/password-reset/${token}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, confirmPassword }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erro ao redefinir senha');
  }

  return res.json();
}

export async function signIn(accessInfo: string, password: string) {
  if (AUTH_BYPASS) {
    return {
      success: true,
      token: 'dev.bypass.token',
      user: { id: 'dev-uid', name: 'Dev User', email: accessInfo },
    } as const;
  }
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ accessInfo, password }),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
      const msg = data?.error ?? data?.message ?? `Falha (${res.status})`;
      throw new Error(msg);
  }
  
  return data as { success: true; token: string; user?: { id: string; name?: string; email?: string } };
}

export async function forgotPassword(email: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = data?.message ?? `Request failed (${res.status})`;
      throw new Error(msg);
    }

    return true;
}

type ApiMeResponse = {
  user: User;
  success?: boolean;
};

export async function getMe(): Promise<ApiMeResponse | null> {
  const res = await authFetch('/api/auth/me', { method: 'GET' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to fetch me');
  return (await res.json()) as ApiMeResponse;
}

export async function apiLogout() {
  const res = await authFetch('/api/auth/logout', { method: 'POST' });
  return res.ok;
}

/* Counts para informações */

export async function getCardsOverview() {
  const res = await authFetch('/api/cards/overview', { method: 'GET' });
  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = parsed?.message ?? parsed?.error ?? `Falha (${res.status})`;
    throw new Error(msg);
  }
  
  const d = parsed.data ?? {};
  return { 
    totalTerapeutas: d.totalTherapists ?? 0, 
    totalClientes: d.totalClients ?? 0, 
    novosTerapeutas: d.newTherapists ?? 0, 
    novosClientes: d.newClients ?? 0,
    TerapeutasAtivos: d.activeTherapists ?? 0,
    ClientesAtivos: d.activeClients ?? 0,
  };
}

export async function getClientesAtivos(): Promise<number> {
  const res = await authFetch('/api/clientes/clientesativos', { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha (${res.status})`;
    throw new Error(msg);
  }

  return data?.data ?? 0;
}