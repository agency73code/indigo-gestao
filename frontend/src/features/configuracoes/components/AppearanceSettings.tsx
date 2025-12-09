import { SettingsContent } from './SettingsContent';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

export function AppearanceSettings() {
    const { theme, setTheme } = useTheme();

    const themeOptions: Array<{ id: 'light' | 'dark' | 'system'; label: string; icon: React.ElementType }> = [
        { id: 'light', label: 'Claro', icon: Sun },
        { id: 'dark', label: 'Escuro', icon: Moon },
        { id: 'system', label: 'Sistema', icon: Monitor },
    ];

    return (
        <SettingsContent>
            <div className="space-y-8">
                {/* Tema */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-[312px] shrink-0">
                        <h3 className="text-sm font-medium text-foreground">Tema</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Escolha o tema de cores do sistema
                        </p>
                    </div>
                    <div className="flex-1">
                        <div className="grid grid-cols-3 gap-4">
                            {themeOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected = theme === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setTheme(option.id)}
                                        className={cn(
                                            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                                            isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-muted hover:border-muted-foreground/30'
                                        )}
                                    >
                                        <Icon className={cn(
                                            'h-6 w-6',
                                            isSelected ? 'text-primary' : 'text-muted-foreground'
                                        )} />
                                        <span className={cn(
                                            'text-sm font-medium',
                                            isSelected ? 'text-foreground' : 'text-muted-foreground'
                                        )}>
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </SettingsContent>
    );
}
