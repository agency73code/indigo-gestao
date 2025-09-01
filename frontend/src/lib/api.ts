export async function validateResetToken(token: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/password-reset/validate/${token}`);

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Token inválido ou expirado');
    }

    return response.json();
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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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