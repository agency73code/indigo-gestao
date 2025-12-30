import type { User } from "@/features/auth/types/auth.types";
import { authFetch } from "./http";
import type { Terapeuta, Cliente } from "@/features/cadastros/types/cadastros.types";
import type { Bank } from '@/common/constants/banks';
import type { Therapist as TerapeutaConsulta, Patient } from '@/features/consultas/types/consultas.types'
import type { ListQueryParams, PaginatedListResult, QueryParams, SaveSessionPayload } from "./types/api.types";

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

export async function listarTerapeutas(
  params: ListQueryParams = {},
): Promise<PaginatedListResult<TerapeutaConsulta>> {
  const query = buildApiUrl('/api/terapeutas', {
    q: params.q,
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize
  });

  const res = await authFetch(query, { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha (${res.status})`;
    throw new Error(msg);
  }
  
  if (Array.isArray(data)) {
    return { items: data as TerapeutaConsulta[] };
  }

  return {
    items: (data?.items ?? []) as TerapeutaConsulta[],
    total: data?.total,
    page: data?.page,
    pageSize: data?.pageSize,
    totalPages: data?.totalPages,
  };
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

export interface ProfessionalMetadataItem {
  id: number;
  nome: string;
}

export interface ProfessionalMetadataResponse {
  areasAtuacao: ProfessionalMetadataItem[];
  cargos: ProfessionalMetadataItem[];
}

export async function fetchProfessionalMetadata(): Promise<ProfessionalMetadataResponse> {
  const res = await authFetch('/api/metadata/profissional', { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha (${res.status})`;
    throw new Error(msg);
  }

  const payload = data?.data ?? {};
  return {
    areasAtuacao: (payload.areaAtuacao ?? []) as ProfessionalMetadataItem[],
    cargos: (payload.cargos ?? []) as ProfessionalMetadataItem[],
  }
}

export async function listarClientes(
  params: ListQueryParams = {},
): Promise<PaginatedListResult<Patient>> {
  const query = buildApiUrl('/api/clientes', {
    q: params.q,
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize
  });
  const res = await authFetch(query, { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha (${res.status})`;
    throw new Error(msg);
  }

  const items = (data?.items ?? data?.normalized ?? []) as Patient[];

  return {
    items,
    total: data?.total,
    page: data?.page,
    pageSize: data?.pageSize,
    totalPages: data?.totalPages,
  }
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

// UTILITY KAIO

export function buildApiUrl(path: string, params?: QueryParams): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const url = new URL(path, base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;

      url.searchParams.set(key, String(value));
    });
  }

  return url.pathname + url.search;
}

export function buildSessionFormData<TAttempt>(payload: SaveSessionPayload<TAttempt>): FormData {
  const formData = new FormData();

  // Dados estruturais
  formData.append('data', JSON.stringify({
    patientId: payload.patientId,
    notes: payload.notes ?? null,
    attempts: payload.attempts,
    area: payload.area,
  }));

  // Arquivos
  const files = payload.files ?? [];
  const meta = [];

  for (const file of files) {
    const originalName = file.file.name;
    const customName = file.name?.trim();
    const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '';

    const finalName = customName
      ? `${customName}${
        ext && !customName.toLowerCase().endsWith(ext.toLowerCase()) ? ext : ''
      }`
      : originalName;

    formData.append('files', file.file, finalName);
    meta.push({ size: file.file.size })
  }
  
  formData.append('filesMeta', JSON.stringify(meta));

  return formData;
}

export function ageCalculation(isoDateString: string): number {
  const hoje = new Date();
  const nascimento = new Date(isoDateString);

  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const mes = hoje.getMonth() - nascimento.getMonth();
  const dia = hoje.getDate() - nascimento.getDate();

  // Se ainda não fez aniversário este ano, tira 1
  if (mes < 0 || (mes === 0 && dia < 0)) {
    idade--;
  }

  return idade;
}

export async function fetchOwnerAvatar(ownerId: string, ownerType: 'cliente' | 'terapeuta'): Promise<string | null> {
  try {
    const response = await fetch(`/api/arquivos/getAvatar?ownerId=${ownerId}&ownerType=${ownerType}`, { 
      credentials: 'include' 
    });
      
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.avatarUrl ?? null;
  } catch (error) {
    console.error('Erro ao buscar avatar:', error);
    return null;
  }
}