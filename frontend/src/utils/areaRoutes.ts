import type { AreaType } from '@/contexts/AreaContext';

/**
 * Utilitários para construir rotas com contexto de área
 * Garante que todas as requisições e navegações incluam a área correta
 */

/**
 * Constrói URL completa incluindo área
 * @example buildAreaRoute('fonoaudiologia', '/programas/novo') => '/app/programas/fonoaudiologia/novo'
 */
export function buildAreaRoute(area: AreaType, path: string): string {
    // Remove barras iniciais do path
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Retorna rota com área
    return `/app/programas/${area}/${cleanPath}`;
}

/**
 * Adiciona área como query parameter para requisições API
 * @example addAreaToApiUrl('/api/programs', 'fonoaudiologia') => '/api/programs?area=fonoaudiologia'
 */
export function addAreaToApiUrl(url: string, area: AreaType): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}area=${area}`;
}

/**
 * Extrai área de uma URL
 * @example extractAreaFromPath('/app/programas/fonoaudiologia/novo') => 'fonoaudiologia'
 */
export function extractAreaFromPath(path: string): AreaType | null {
    const match = path.match(/\/programas\/([^\/]+)/);
    if (!match) return null;
    
    const segment = match[1];
    const validAreas: AreaType[] = [
        'fonoaudiologia',
        'psicoterapia',
        'terapia-aba',
        'terapia-ocupacional',
        'fisioterapia',
        'psicomotricidade',
        'educacao-fisica',
        'psicopedagogia',
        'musicoterapia',
        'neuropsicologia',
    ];
    
    return validAreas.includes(segment as AreaType) ? (segment as AreaType) : null;
}

/**
 * Adiciona área aos headers de uma requisição HTTP
 */
export function addAreaToHeaders(headers: HeadersInit = {}, area: AreaType): HeadersInit {
    return {
        ...headers,
        'X-Area': area,
    };
}
