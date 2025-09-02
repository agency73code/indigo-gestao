export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(input, { ...init, headers });
    return res;
}