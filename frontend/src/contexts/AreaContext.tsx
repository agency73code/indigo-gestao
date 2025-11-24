import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useParams, useLocation } from 'react-router-dom';

/**
 * Tipos de áreas disponíveis no sistema
 * Cada área compartilha os mesmos componentes mas tem dados separados
 */
export type AreaType = 
    | 'fonoaudiologia' 
    | 'psicoterapia' 
    | 'terapia-aba' 
    | 'terapia-ocupacional'
    | 'fisioterapia'
    | 'psicomotricidade'
    | 'educacao-fisica'
    | 'psicopedagogia'
    | 'musicoterapia'
    | 'neuropsicologia';

/**
 * Mapeamento de áreas para labels exibidos na UI
 */
export const AREA_LABELS: Record<AreaType, string> = {
    'fonoaudiologia': 'Fonoaudiologia',
    'psicoterapia': 'Psicoterapia',
    'terapia-aba': 'Terapia ABA',
    'terapia-ocupacional': 'Terapia Ocupacional',
    'fisioterapia': 'Fisioterapia',
    'psicomotricidade': 'Psicomotricidade',
    'educacao-fisica': 'Educação Física',
    'psicopedagogia': 'Psicopedagogia',
    'musicoterapia': 'Musicoterapia',
    'neuropsicologia': 'Neuropsicologia',
};

/**
 * Mapeamento de slugs antigos para novos tipos de área
 * Mantém compatibilidade com rotas existentes
 */
export const AREA_SLUG_MAP: Record<string, AreaType> = {
    'fono': 'fonoaudiologia',
    'fonoaudiologia': 'fonoaudiologia',
    'psico': 'psicoterapia',
    'psicoterapia': 'psicoterapia',
    'aba': 'terapia-aba',
    'terapia-aba': 'terapia-aba',
    'to': 'terapia-ocupacional',
    'terapia-ocupacional': 'terapia-ocupacional',
    'fisio': 'fisioterapia',
    'fisioterapia': 'fisioterapia',
    'psicomotricidade': 'psicomotricidade',
    'educacao-fisica': 'educacao-fisica',
    'psicopedagogia': 'psicopedagogia',
    'musicoterapia': 'musicoterapia',
    'neuropsicologia': 'neuropsicologia',
};

interface AreaContextType {
    currentArea: AreaType | null;
    setCurrentArea: (area: AreaType | null) => void;
    getAreaLabel: (area?: AreaType | null) => string;
    isAreaActive: (area: AreaType) => boolean;
}

const AreaContext = createContext<AreaContextType | undefined>(undefined);

interface AreaProviderProps {
    children: ReactNode;
}

/**
 * Provider que gerencia a área ativa globalmente
 * Sincroniza com parâmetros da URL e localStorage
 */
export function AreaProvider({ children }: AreaProviderProps) {
    const params = useParams<{ area?: string }>();
    const location = useLocation();
    const [currentArea, setCurrentAreaState] = useState<AreaType | null>(() => {
        // Tentar recuperar do localStorage
        const stored = localStorage.getItem('currentArea');
        
        // Migração: se for 'fono-psico', limpar
        if (stored === 'fono-psico') {
            localStorage.removeItem('currentArea');
            return null;
        }
        
        return stored && stored in AREA_LABELS ? (stored as AreaType) : null;
    });

    useEffect(() => {
        // Extrair área da URL
        let detectedArea: AreaType | null = null;

        // 1. Verificar parâmetro direto :area
        if (params.area && params.area in AREA_SLUG_MAP) {
            detectedArea = AREA_SLUG_MAP[params.area];
        }
        
        // 2. Verificar segmentos do path para rotas especiais
        const pathSegments = location.pathname.split('/').filter(Boolean);
        
        // Mapeamento de slugs de URL para tipos de área
        const urlToAreaMap: Record<string, AreaType> = {
            'terapia-ocupacional': 'terapia-ocupacional',
            'fonoaudiologia': 'fonoaudiologia',
            'psicoterapia': 'psicoterapia',
            'terapia-aba': 'terapia-aba',
            'fisioterapia': 'fisioterapia',
            'psicomotricidade': 'psicomotricidade',
            'educacao-fisica': 'educacao-fisica',
            'psicopedagogia': 'psicopedagogia',
            'musicoterapia': 'musicoterapia',
            'neuropsicologia': 'neuropsicologia',
        };

        // Procurar correspondência nos segmentos da URL
        for (const segment of pathSegments) {
            if (segment in urlToAreaMap) {
                detectedArea = urlToAreaMap[segment];
                break;
            }
        }

        if (detectedArea && detectedArea !== currentArea) {
            setCurrentAreaState(detectedArea);
            localStorage.setItem('currentArea', detectedArea);
        }
    }, [params.area, location.pathname, currentArea]);

    const setCurrentArea = (area: AreaType | null) => {
        setCurrentAreaState(area);
        if (area) {
            localStorage.setItem('currentArea', area);
        } else {
            localStorage.removeItem('currentArea');
        }
    };

    const getAreaLabel = (area?: AreaType | null): string => {
        const areaToUse = area ?? currentArea;
        return areaToUse ? AREA_LABELS[areaToUse] : 'Área';
    };

    const isAreaActive = (area: AreaType): boolean => {
        return currentArea === area;
    };

    return (
        <AreaContext.Provider value={{ currentArea, setCurrentArea, getAreaLabel, isAreaActive }}>
            {children}
        </AreaContext.Provider>
    );
}

/**
 * Hook para acessar contexto de área
 */
export function useArea() {
    const context = useContext(AreaContext);
    if (context === undefined) {
        throw new Error('useArea must be used within an AreaProvider');
    }
    return context;
}

/**
 * Hook utilitário que retorna a área atual ou default
 */
export function useCurrentArea(defaultArea: AreaType = 'fonoaudiologia'): AreaType {
    const { currentArea } = useArea();
    return currentArea ?? defaultArea;
}
