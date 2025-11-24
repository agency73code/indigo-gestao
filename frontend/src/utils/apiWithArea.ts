/**
 * Wrapper para fetch que adiciona automaticamente a área atual nas requisições
 * 
 * IMPORTANTE PARA O BACKEND:
 * - Todas as requisições incluem o parâmetro `area` na query string
 * - O backend deve filtrar TODOS os dados (programas, sessões, etc.) por esse parâmetro
 * - Formato: ?area=fonoaudiologia, ?area=terapia-aba, etc.
 * 
 * Exemplo de uso no backend:
 * ```typescript
 * const area = req.query.area; // 'fonoaudiologia' | 'terapia-aba' | etc
 * const programs = await db.programs.findMany({ where: { area } });
 * ```
 */

import type { AreaType } from '@/contexts/AreaContext';

/**
 * Recupera a área atual do localStorage
 * Usado para adicionar em requisições de API
 */
export function getCurrentAreaFromStorage(): AreaType | null {
    try {
        const stored = localStorage.getItem('currentArea');
        return stored as AreaType | null;
    } catch {
        return null;
    }
}

/**
 * Adiciona o parâmetro `area` à URL
 */
export function addAreaToUrl(url: string, area: AreaType | null): string {
    if (!area) return url;
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}area=${encodeURIComponent(area)}`;
}

/**
 * Wrapper do fetch que adiciona automaticamente a área atual
 * 
 * COMO USAR:
 * ```typescript
 * // Em vez de:
 * const res = await fetch('/api/ocp/programs');
 * 
 * // Use:
 * const res = await fetchWithArea('/api/ocp/programs');
 * ```
 */
export async function fetchWithArea(
    url: string,
    options?: RequestInit
): Promise<Response> {
    const area = getCurrentAreaFromStorage();
    const urlWithArea = addAreaToUrl(url, area);
    
    return fetch(urlWithArea, options);
}

/**
 * Adiciona a área nos headers da requisição
 * Pode ser usado junto com o query param para redundância
 */
export function addAreaToHeaders(
    headers: HeadersInit = {},
    area: AreaType | null
): HeadersInit {
    if (!area) return headers;
    
    const headersObj = new Headers(headers);
    headersObj.set('X-Area', area);
    
    return Object.fromEntries(headersObj.entries());
}

/**
 * Adiciona a área no body da requisição (para POST/PUT/PATCH)
 */
export function addAreaToBody<T extends Record<string, any>>(
    body: T,
    area: AreaType | null
): T & { area?: AreaType } {
    if (!area) return body;
    
    return { ...body, area };
}
