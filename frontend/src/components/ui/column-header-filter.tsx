/**
 * ColumnHeaderFilter - Filtro inline no cabeçalho da coluna
 * 
 * Exibe um ícone de filtro ao lado do nome da coluna que abre um dropdown
 */

import { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

export interface ColumnHeaderFilterProps {
    /** Nome da coluna */
    label: string;
    /** Opções do filtro */
    options: FilterOption[];
    /** Valor selecionado */
    value?: string;
    /** Callback quando muda */
    onChange: (value: string | undefined) => void;
    /** Se está carregando */
    loading?: boolean;
    /** Alinhamento do popover */
    align?: 'start' | 'center' | 'end';
}

export function ColumnHeaderFilter({
    label,
    options,
    value,
    onChange,
    loading = false,
    align = 'start',
}: ColumnHeaderFilterProps) {
    const [open, setOpen] = useState(false);
    const hasFilter = value && value !== 'all';
    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="flex items-center gap-1">
            <span>{label}</span>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        className={cn(
                            "p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors",
                            hasFilter && "text-primary"
                        )}
                        disabled={loading || options.length === 0}
                    >
                        <Filter className={cn(
                            "h-3.5 w-3.5",
                            hasFilter ? "fill-primary/20" : "opacity-50"
                        )} />
                    </button>
                </PopoverTrigger>
                
                <PopoverContent className="w-56 p-0" align={align}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                        <span className="text-xs font-medium text-muted-foreground">
                            Filtrar {label.toLowerCase()}
                        </span>
                        {hasFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    onChange(undefined);
                                    setOpen(false);
                                }}
                                className="h-6 px-2 text-xs"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Limpar
                            </Button>
                        )}
                    </div>

                    {/* Opções */}
                    <div className="max-h-[280px] overflow-y-auto py-1">
                        {/* Opção "Todos" */}
                        <button
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors",
                                !hasFilter && "bg-muted/30"
                            )}
                            onClick={() => {
                                onChange(undefined);
                                setOpen(false);
                            }}
                        >
                            <span>Todos</span>
                            {!hasFilter && <Check className="h-4 w-4 text-primary" />}
                        </button>

                        {/* Opções dinâmicas */}
                        {options.map((option) => (
                            <button
                                key={option.value}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors",
                                    value === option.value && "bg-muted/30"
                                )}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    {option.label}
                                    {option.count !== undefined && (
                                        <span className="text-xs text-muted-foreground">
                                            ({option.count})
                                        </span>
                                    )}
                                </span>
                                {value === option.value && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        ))}
                    </div>

                    {/* Footer com info */}
                    {hasFilter && selectedOption && (
                        <div className="px-3 py-2 border-t bg-muted/20">
                            <p className="text-xs text-muted-foreground">
                                Filtrando por: <span className="font-medium text-foreground">{selectedOption.label}</span>
                            </p>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default ColumnHeaderFilter;
