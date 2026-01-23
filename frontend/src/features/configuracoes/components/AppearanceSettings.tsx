import { SettingsContent } from './SettingsContent';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme, PRIMARY_COLORS } from '@/contexts/ThemeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Agrupa cores por categoria para melhor organização visual
const COLOR_CATEGORIES = [
    { 
        name: 'Azuis', 
        colors: ['indigo', 'navy', 'steel', 'slate-blue', 'ocean'] 
    },
    { 
        name: 'Verdes', 
        colors: ['sage', 'forest', 'teal', 'mint'] 
    },
    { 
        name: 'Terrosos', 
        colors: ['terracotta', 'copper', 'caramel'] 
    },
    { 
        name: 'Rosados', 
        colors: ['dusty-rose', 'mauve', 'blush'] 
    },
    { 
        name: 'Roxos', 
        colors: ['plum', 'lavender', 'wisteria'] 
    },
    { 
        name: 'Neutros', 
        colors: ['black', 'charcoal', 'graphite', 'gray', 'gray-warm', 'gray-cool', 'stone'] 
    },
];

export function AppearanceSettings() {
    const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme();

    const themeOptions: Array<{ id: 'light' | 'dark' | 'system'; label: string; icon: React.ElementType }> = [
        { id: 'light', label: 'Claro', icon: Sun },
        { id: 'dark', label: 'Escuro', icon: Moon },
        { id: 'system', label: 'Sistema', icon: Monitor },
    ];

    return (
        <SettingsContent>
            <div className="space-y-10">
                {/* Tema */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-[280px] shrink-0">
                        <h3 className="text-sm font-medium text-foreground">Tema</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Escolha o tema de cores do sistema
                        </p>
                    </div>
                    <div className="flex-1">
                        <div className="grid grid-cols-3 gap-3 max-w-md">
                            {themeOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected = theme === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setTheme(option.id)}
                                        className={cn(
                                            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200',
                                            isSelected
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                                        )}
                                    >
                                        <Icon className={cn(
                                            'h-5 w-5',
                                            isSelected ? 'text-primary' : 'text-muted-foreground'
                                        )} />
                                        <span className={cn(
                                            'text-sm',
                                            isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'
                                        )}>
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Cor Principal */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-[280px] shrink-0">
                        <h3 className="text-sm font-medium text-foreground">Cor Principal</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Personalize a cor dos elementos do sistema
                        </p>
                    </div>
                    <div className="flex-1">
                        <TooltipProvider delayDuration={300}>
                            <div className="space-y-4">
                                {COLOR_CATEGORIES.map((category) => (
                                    <div key={category.name} className="space-y-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {category.name}
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {category.colors.map((colorId) => {
                                                const color = PRIMARY_COLORS.find(c => c.id === colorId);
                                                if (!color) return null;
                                                const isSelected = primaryColor === color.id;
                                                return (
                                                    <Tooltip key={color.id}>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() => setPrimaryColor(color.id)}
                                                                className={cn(
                                                                    'relative w-9 h-9 rounded-lg transition-all duration-200',
                                                                    'hover:scale-105',
                                                                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring',
                                                                    isSelected && 'ring-2 ring-offset-2 ring-offset-background ring-foreground/70 scale-105'
                                                                )}
                                                                style={{ backgroundColor: color.hex }}
                                                            >
                                                                {isSelected && (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <Check className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" className="text-xs">
                                                            {color.name}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </SettingsContent>
    );
}
