export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const headers = new Headers(init.headers || {});
    const res = await fetch(input, { ...init, headers, credentials: 'include' });
    return res;
}