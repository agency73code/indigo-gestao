import { AppError } from '../errors/AppError.js';

const BANKS_URL = 'https://brasilapi.com.br/api/banks/v1';
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

type BrasilApiBank = {
    ispb: string;
    name: string;
    code: number | null;
    fullName: string;
};

export type BrazilBankOption = {
    code: string;
    name: string;
    fullName: string;
    ispb: string;
};

let cachedBanks: { data: BrazilBankOption[]; expiresAt: number } | null = null;

export async function fetchBrazilianBanks(forceRefresh = false): Promise<BrazilBankOption[]> {
    const now = Date.now();
    if (!forceRefresh && cachedBanks && cachedBanks.expiresAt > now) {
        return cachedBanks.data;
    }

    let response: Response;
    try {
        response = await fetch(BANKS_URL);
    } catch {
        throw new AppError(
            'BRASIL_API_NETWORK_ERROR',
            'Não foi possível consultar a lista de bancos no momento.',
            502,
        );
    }

    if (!response.ok) {
        throw new AppError(
            'BRASIL_API_RESPONSE_ERROR',
            'Falha ao consultar a lista de bancos na Brasil API.',
            response.status || 502,
        );
    }

    const payload = (await response.json()) as BrasilApiBank[];

    const sanitized = payload
        .filter((bank) => bank && bank.name)
        .map((bank) => {
            const code = bank.code !== null ? String(bank.code).padStart(3, '0') : bank.ispb;
            return {
                code,
                name: bank.name.trim(),
                fullName: bank.fullName?.trim() || bank.name.trim(),
                ispb: bank.ispb,
            } satisfies BrazilBankOption;
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    cachedBanks = {
        data: sanitized,
        expiresAt: now + CACHE_TTL_MS,
    };

    return sanitized;
}

export function clearBrazilianBanksCache() {
    cachedBanks = null;
}
