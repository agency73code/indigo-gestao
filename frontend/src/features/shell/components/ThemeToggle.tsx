import { Moon, Sun } from 'lucide-react';
import { Button } from '@/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
    const { resolvedTheme, toggleTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-full w-full hover:bg-transparent"
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
            {isDark ? (
                <Sun className="h-4 w-4 text-black transition-all" />
            ) : (
                <Moon className="h-4 w-4 text-white transition-all" />
            )}
        </Button>
    );
}
