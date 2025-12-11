export type Tables = 'terapeuta' | 'cliente';

export interface AuthUser {
    id: string | number;
    nome: string;
    email: string | null;
    perfil_acesso: string;
    avatar_url?: string | null;
    area_atuacao?: string[];
}

export interface UserRow extends AuthUser {
    senha: string | null;
}

export interface ResetTokenData {
    token: string;
    expiresAt: Date;
}

export const AREA_NAME_TO_PROGRAM_ID: Record<string, string> = {
    fonoaudiologia: 'fonoaudiologia',
    psicopedagogia: 'psicopedagogia',
    'terapia aba': 'terapia-aba',
    'terapia ocupacional': 'terapia-ocupacional',
    psicoterapia: 'psicoterapia',
    fisioterapia: 'fisioterapia',
    psicomotricidade: 'psicomotricidade',
    'educador fisico': 'educacao-fisica',
    'educacao fisica': 'educacao-fisica',
    musicoterapia: 'musicoterapia',
    neuropsicologia: 'neuropsicologia',
}