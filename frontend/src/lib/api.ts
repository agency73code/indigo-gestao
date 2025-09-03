const AUTH_BYPASS =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true';

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

// --- protected endpoints ---
import { authFetch } from "./http";

export async function getMe() {
  const res = await authFetch('/api/auth/me');
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as { success: true; user: { id: string; name: string; email: string | null } };
}