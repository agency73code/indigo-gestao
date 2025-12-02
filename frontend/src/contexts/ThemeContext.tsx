import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
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
    }, [theme]);

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
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        // Toggle alterna entre light e dark (não system)
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, toggleTheme }}>
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
