const REFRESH_TOKEN_STORAGE_KEY = 'auth:refreshToken';
const RETRY_HEADER = 'x-auth-retry';

let refreshPromise: Promise<boolean> | null = null;

function toUrlString(input: RequestInfo | URL): string {
    return typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
}

function isRefreshEndpoint(input: RequestInfo | URL): boolean {
    const url = toUrlString(input);
    return url.includes('auth/refresh') || url.includes('/api/auth/refresh');
}

export function getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function storeRefreshToken(refreshToken?: string | null) {
    if (typeof window === 'undefined') return;
    if (!refreshToken) {
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        return;
    }

    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        storeRefreshToken(null);
        return false;
    }

    const data = (await response.json()) as { refreshToken?: string };
    if (data.refreshToken) {
        storeRefreshToken(data.refreshToken);
    }

    return true;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const headers = new Headers(init.headers || {});
    const isRetry = headers.get(RETRY_HEADER) === '1';

    if (isRetry) {
        headers.delete(RETRY_HEADER);
    }

    const res = await fetch(input, { ...init, headers, credentials: 'include' });
    
    if (res.status !== 401 || isRetry || isRefreshEndpoint(input)) {
        return res;
    }

    if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
        });
    }

    const didRefresh = await refreshPromise;
    if (!didRefresh) {
        return res;
    }

    const retryHeaders = new Headers(init.headers || {});
    retryHeaders.set(RETRY_HEADER, '1');

    return fetch(input, {
        ...init,
        headers: retryHeaders,
        credentials: 'include',
    });
}