// Mapeamento de cores para especialidades
export const SPECIALTY_COLORS: Record<string, { bg: string; text: string }> = {
    'Fonoaudiologia': { bg: '#E3F2FD', text: '#4A6A8F' },
    'Psicomotricidade': { bg: '#F3E5F5', text: '#7A6A8F' },
    'Fisioterapia': { bg: '#E8F5E9', text: '#5A8F6A' },
    'Terapia Ocupacional': { bg: '#FFF3E0', text: '#A57A5A' },
    'Psicopedagogia': { bg: '#FCE4EC', text: '#8F6A7A' },
    'Educador Físico': { bg: '#E0F2F1', text: '#5A8F85' },
    'Terapia ABA': { bg: '#F1F8E9', text: '#758F5A' },
    'Musicoterapia': { bg: '#EDE7F6', text: '#7A6AA5' },
    'Pedagogia': { bg: '#FFF9C4', text: '#A5955A' },
    'Neuropsicologia': { bg: '#E1F5FE', text: '#5A7EA5' },
    'Nutrição': { bg: '#FFEBEE', text: '#A56A6A' },
};

export const DEFAULT_SPECIALTY_COLOR = { 
    bg: 'rgba(25, 22, 29, 0.06)', 
    text: 'var(--table-text)' 
};

// Mapa normalizado para busca case-insensitive
const SPECIALTY_COLORS_NORMALIZED = Object.fromEntries(
    Object.entries(SPECIALTY_COLORS).map(([key, value]) => [key.toLowerCase(), value])
);

/**
 * Retorna as cores (background e text) para uma especialidade específica
 * Busca case-insensitive para lidar com variações de capitalização
 */
export function getSpecialtyColors(specialty?: string | null): { bg: string; text: string } {
    if (!specialty) return DEFAULT_SPECIALTY_COLOR;
    
    // Primeiro tenta match exato, depois case-insensitive
    return SPECIALTY_COLORS[specialty] 
        || SPECIALTY_COLORS_NORMALIZED[specialty.toLowerCase()] 
        || DEFAULT_SPECIALTY_COLOR;
}
