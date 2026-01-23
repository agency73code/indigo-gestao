import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

// Cores primárias disponíveis para personalização - Paleta profissional com tons suaves
export interface PrimaryColor {
    id: string;
    name: string;
    hex: string;
    oklch: {
        light: string; // --primary para modo claro
        dark: string;  // --primary para modo escuro
    };
    ring: {
        light: string;
        dark: string;
    };
}

export const PRIMARY_COLORS: PrimaryColor[] = [
    // ═══════════════════════════════════════════════════════════════
    // AZUIS - Tons profissionais e corporativos
    // ═══════════════════════════════════════════════════════════════
    { 
        id: 'indigo', 
        name: 'Indigo', 
        hex: '#2B4970', 
        oklch: { 
            light: 'oklch(0.369 0.063 254.12)', 
            dark: 'oklch(0.65 0.12 254.12)' 
        }, 
        ring: { 
            light: 'oklch(0.50 0.10 254.12)', 
            dark: 'oklch(0.55 0.10 254.12)' 
        } 
    },
    { 
        id: 'navy', 
        name: 'Marinho', 
        hex: '#1e3a5f', 
        oklch: { 
            light: 'oklch(0.32 0.06 250)', 
            dark: 'oklch(0.58 0.10 250)' 
        }, 
        ring: { 
            light: 'oklch(0.45 0.08 250)', 
            dark: 'oklch(0.50 0.08 250)' 
        } 
    },
    { 
        id: 'steel', 
        name: 'Aço', 
        hex: '#4a6fa5', 
        oklch: { 
            light: 'oklch(0.52 0.08 250)', 
            dark: 'oklch(0.68 0.10 250)' 
        }, 
        ring: { 
            light: 'oklch(0.58 0.08 250)', 
            dark: 'oklch(0.62 0.08 250)' 
        } 
    },
    { 
        id: 'slate-blue', 
        name: 'Azul Ardósia', 
        hex: '#6b8cae', 
        oklch: { 
            light: 'oklch(0.62 0.06 240)', 
            dark: 'oklch(0.72 0.08 240)' 
        }, 
        ring: { 
            light: 'oklch(0.65 0.06 240)', 
            dark: 'oklch(0.68 0.06 240)' 
        } 
    },
    { 
        id: 'ocean', 
        name: 'Oceano', 
        hex: '#3d7a99', 
        oklch: { 
            light: 'oklch(0.52 0.08 220)', 
            dark: 'oklch(0.68 0.10 220)' 
        }, 
        ring: { 
            light: 'oklch(0.58 0.08 220)', 
            dark: 'oklch(0.62 0.08 220)' 
        } 
    },
    
    // ═══════════════════════════════════════════════════════════════
    // VERDES - Tons naturais e equilibrados
    // ═══════════════════════════════════════════════════════════════
    { 
        id: 'sage', 
        name: 'Sálvia', 
        hex: '#7d9a78', 
        oklch: { 
            light: 'oklch(0.62 0.06 145)', 
            dark: 'oklch(0.72 0.08 145)' 
        }, 
        ring: { 
            light: 'oklch(0.65 0.06 145)', 
            dark: 'oklch(0.68 0.06 145)' 
        } 
    },
    { 
        id: 'forest', 
        name: 'Floresta', 
        hex: '#4a6741', 
        oklch: { 
            light: 'oklch(0.45 0.08 140)', 
            dark: 'oklch(0.62 0.10 140)' 
        }, 
        ring: { 
            light: 'oklch(0.52 0.08 140)', 
            dark: 'oklch(0.58 0.08 140)' 
        } 
    },
    { 
        id: 'teal', 
        name: 'Verde-Azulado', 
        hex: '#4a8f8f', 
        oklch: { 
            light: 'oklch(0.58 0.08 185)', 
            dark: 'oklch(0.70 0.10 185)' 
        }, 
        ring: { 
            light: 'oklch(0.62 0.08 185)', 
            dark: 'oklch(0.65 0.08 185)' 
        } 
    },
    { 
        id: 'mint', 
        name: 'Menta', 
        hex: '#5a9e8f', 
        oklch: { 
            light: 'oklch(0.62 0.08 170)', 
            dark: 'oklch(0.72 0.10 170)' 
        }, 
        ring: { 
            light: 'oklch(0.65 0.08 170)', 
            dark: 'oklch(0.68 0.08 170)' 
        } 
    },
    
    // ═══════════════════════════════════════════════════════════════
    // TERROSOS - Tons quentes e acolhedores
    // ═══════════════════════════════════════════════════════════════
    { 
        id: 'terracotta', 
        name: 'Terracota', 
        hex: '#a67c5b', 
        oklch: { 
            light: 'oklch(0.58 0.08 55)', 
            dark: 'oklch(0.70 0.10 55)' 
        }, 
        ring: { 
            light: 'oklch(0.62 0.08 55)', 
            dark: 'oklch(0.65 0.08 55)' 
        } 
    },
    { 
        id: 'copper', 
        name: 'Cobre', 
        hex: '#9a7b4f', 
        oklch: { 
            light: 'oklch(0.55 0.08 70)', 
            dark: 'oklch(0.68 0.10 70)' 
        }, 
        ring: { 
            light: 'oklch(0.60 0.08 70)', 
            dark: 'oklch(0.62 0.08 70)' 
        } 
    },
    { 
        id: 'caramel', 
        name: 'Caramelo', 
        hex: '#a68a5b', 
        oklch: { 
            light: 'oklch(0.60 0.08 75)', 
            dark: 'oklch(0.72 0.10 75)' 
        }, 
        ring: { 
            light: 'oklch(0.64 0.08 75)', 
            dark: 'oklch(0.68 0.08 75)' 
        } 
    },
    
    // ═══════════════════════════════════════════════════════════════
    // ROSADOS - Tons suaves e elegantes
    // ═══════════════════════════════════════════════════════════════
    { 
        id: 'dusty-rose', 
        name: 'Rosa Antigo', 
        hex: '#b08b8b', 
        oklch: { 
            light: 'oklch(0.62 0.05 15)', 
            dark: 'oklch(0.72 0.07 15)' 
        }, 
        ring: { 
            light: 'oklch(0.65 0.05 15)', 
            dark: 'oklch(0.68 0.05 15)' 
        } 
    },
    { 
        id: 'mauve', 
        name: 'Malva', 
        hex: '#9a7b8a', 
        oklch: { 
            light: 'oklch(0.55 0.06 340)', 
            dark: 'oklch(0.68 0.08 340)' 
        }, 
        ring: { 
            light: 'oklch(0.60 0.06 340)', 
            dark: 'oklch(0.62 0.06 340)' 
        } 
    },
    { 
        id: 'blush', 
        name: 'Rosado', 
        hex: '#c4a4a4', 
        oklch: { 
            light: 'oklch(0.72 0.04 15)', 
            dark: 'oklch(0.78 0.05 15)' 
        }, 
        ring: { 
            light: 'oklch(0.74 0.04 15)', 
            dark: 'oklch(0.76 0.04 15)' 
        } 
    },
    
    // ═══════════════════════════════════════════════════════════════
    // ROXOS - Tons sofisticados e discretos
    // ═══════════════════════════════════════════════════════════════
    { 
        id: 'plum', 
        name: 'Ameixa', 
        hex: '#6b5b7a', 
        oklch: { 
            light: 'oklch(0.45 0.06 300)', 
            dark: 'oklch(0.62 0.08 300)' 
        }, 
        ring: { 
            light: 'oklch(0.52 0.06 300)', 
            dark: 'oklch(0.58 0.06 300)' 
        } 
    },
    { 
        id: 'lavender', 
        name: 'Lavanda', 
        hex: '#8b7b9a', 
        oklch: { 
            light: 'oklch(0.55 0.05 290)', 
            dark: 'oklch(0.68 0.07 290)' 
        }, 
        ring: { 
            light: 'oklch(0.60 0.05 290)', 
            dark: 'oklch(0.62 0.05 290)' 
        } 
    },
    { 
        id: 'wisteria', 
        name: 'Glicínia', 
        hex: '#9b8faa', 
        oklch: { 
            light: 'oklch(0.62 0.05 285)', 
            dark: 'oklch(0.72 0.06 285)' 
        }, 
        ring: { 
            light: 'oklch(0.65 0.05 285)', 
            dark: 'oklch(0.68 0.05 285)' 
        } 
    },
    
    // ═══════════════════════════════════════════════════════════════
    // NEUTROS - Tons elegantes e atemporais
    // ═══════════════════════════════════════════════════════════════
    { 
        id: 'black', 
        name: 'Preto', 
        hex: '#1a1a1a', 
        oklch: { 
            light: 'oklch(0.20 0.00 0)', 
            dark: 'oklch(0.75 0.00 0)' 
        }, 
        ring: { 
            light: 'oklch(0.30 0.00 0)', 
            dark: 'oklch(0.65 0.00 0)' 
        } 
    },
    { 
        id: 'charcoal', 
        name: 'Carvão', 
        hex: '#2d2d2d', 
        oklch: { 
            light: 'oklch(0.28 0.00 0)', 
            dark: 'oklch(0.70 0.00 0)' 
        }, 
        ring: { 
            light: 'oklch(0.35 0.00 0)', 
            dark: 'oklch(0.60 0.00 0)' 
        } 
    },
    { 
        id: 'graphite', 
        name: 'Grafite', 
        hex: '#404040', 
        oklch: { 
            light: 'oklch(0.35 0.00 0)', 
            dark: 'oklch(0.65 0.00 0)' 
        }, 
        ring: { 
            light: 'oklch(0.42 0.00 0)', 
            dark: 'oklch(0.55 0.00 0)' 
        } 
    },
    { 
        id: 'gray', 
        name: 'Cinza', 
        hex: '#525252', 
        oklch: { 
            light: 'oklch(0.42 0.00 0)', 
            dark: 'oklch(0.62 0.00 0)' 
        }, 
        ring: { 
            light: 'oklch(0.48 0.00 0)', 
            dark: 'oklch(0.52 0.00 0)' 
        } 
    },
    { 
        id: 'gray-warm', 
        name: 'Cinza Quente', 
        hex: '#57534e', 
        oklch: { 
            light: 'oklch(0.42 0.02 60)', 
            dark: 'oklch(0.62 0.02 60)' 
        }, 
        ring: { 
            light: 'oklch(0.48 0.02 60)', 
            dark: 'oklch(0.52 0.02 60)' 
        } 
    },
    { 
        id: 'gray-cool', 
        name: 'Cinza Frio', 
        hex: '#4b5563', 
        oklch: { 
            light: 'oklch(0.42 0.02 250)', 
            dark: 'oklch(0.62 0.02 250)' 
        }, 
        ring: { 
            light: 'oklch(0.48 0.02 250)', 
            dark: 'oklch(0.52 0.02 250)' 
        } 
    },
    { 
        id: 'stone', 
        name: 'Pedra', 
        hex: '#78716c', 
        oklch: { 
            light: 'oklch(0.52 0.02 50)', 
            dark: 'oklch(0.65 0.02 50)' 
        }, 
        ring: { 
            light: 'oklch(0.58 0.02 50)', 
            dark: 'oklch(0.60 0.02 50)' 
        } 
    },
];

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
    toggleTheme: () => void;
    primaryColor: string;
    setPrimaryColor: (colorId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme';
const PRIMARY_COLOR_STORAGE_KEY = 'primary-color';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
}

function applyPrimaryColor(colorId: string, resolvedTheme: 'light' | 'dark') {
    const color = PRIMARY_COLORS.find(c => c.id === colorId);
    if (!color) return;

    const root = document.documentElement;
    const isDark = resolvedTheme === 'dark';
    
    // Aplicar cor primária
    root.style.setProperty('--primary', isDark ? color.oklch.dark : color.oklch.light);
    root.style.setProperty('--ring', isDark ? color.ring.dark : color.ring.light);
    
    // Cor de contraste para texto e ícones sobre a cor primária (branco 98% para máxima legibilidade)
    const foreground = 'oklch(0.98 0 0)'; // Branco quase puro para ambos os modos
    root.style.setProperty('--primary-foreground', foreground);
    
    // Atualizar cores da sidebar para manter consistência
    root.style.setProperty('--sidebar-primary', isDark ? color.oklch.dark : color.oklch.light);
    root.style.setProperty('--sidebar-primary-foreground', foreground);
    root.style.setProperty('--sidebar-ring', isDark ? color.ring.dark : color.ring.light);
    
    // Cores para chart que usam a cor primária
    root.style.setProperty('--chart-1', isDark ? color.oklch.dark : color.oklch.light);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
            // Se não tem tema salvo, usa 'light' como padrão (não 'system')
            if (!stored) return 'light';
            // Converte valores antigos 'light'/'dark' para o novo sistema
            if (stored === 'light' || stored === 'dark') return stored;
            return stored;
        }
        return 'light';
    });

    const [primaryColor, setPrimaryColorState] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(PRIMARY_COLOR_STORAGE_KEY) || 'indigo';
        }
        return 'indigo';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
        if (theme === 'system') {
            return getSystemTheme();
        }
        return theme === 'dark' ? 'dark' : 'light';
    });

    // Atualizar o tema resolvido quando o tema muda
    useEffect(() => {
        let resolved: 'light' | 'dark';
        
        if (theme === 'system') {
            resolved = getSystemTheme();
        } else {
            resolved = theme;
        }
        
        setResolvedTheme(resolved);

        // Aplicar classe no documento
        const root = document.documentElement;
        if (resolved === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Salvar no localStorage
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        
        // Reaplicar cor primária quando tema muda
        applyPrimaryColor(primaryColor, resolved);
    }, [theme, primaryColor]);

    // Aplicar cor primária quando ela muda
    useEffect(() => {
        applyPrimaryColor(primaryColor, resolvedTheme);
        localStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, primaryColor);
    }, [primaryColor, resolvedTheme]);

    // Escutar mudanças no tema do sistema
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const newResolved = e.matches ? 'dark' : 'light';
            setResolvedTheme(newResolved);
            const root = document.documentElement;
            if (newResolved === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            // Reaplicar cor quando tema do sistema muda
            applyPrimaryColor(primaryColor, newResolved);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, primaryColor]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const setPrimaryColor = (colorId: string) => {
        setPrimaryColorState(colorId);
    };

    const toggleTheme = () => {
        // Toggle alterna entre light e dark (não system)
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, toggleTheme, primaryColor, setPrimaryColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
