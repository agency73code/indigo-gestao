/**
 * FiltersPopover - Componente genérico de filtros reutilizável
 * 
 * Uso:
 * ```tsx
 * <FiltersPopover
 *   filters={[
 *     { type: 'select', key: 'status', label: 'Status', options: [...] },
 *     { type: 'select', key: 'orderBy', label: 'Ordenar por', options: [...] },
 *     { type: 'date-range', key: 'periodo', label: 'Período' },
 *   ]}
 *   values={{ status: 'all', orderBy: 'recent' }}
 *   onChange={(key, value) => handleChange(key, value)}
 *   onClear={() => handleClear()}
 * />
 * ```
 */

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DateRangePickerField, type DateRangeValue } from '@/ui/date-range-picker-field';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

export interface FilterSelectOption {
    value: string;
    label: string;
}

export interface FilterSelectConfig {
    type: 'select';
    key: string;
    label: string;
    options: FilterSelectOption[];
    placeholder?: string;
    defaultValue?: string;
    /** Se deve mostrar loading no select */
    loading?: boolean;
}

export interface FilterDateRangeConfig {
    type: 'date-range';
    key: string;
    label: string;
    placeholder?: string;
}

export type FilterConfig = FilterSelectConfig | FilterDateRangeConfig;

// Tipo para valores de filtros
export type FilterValues = Record<string, string | DateRangeValue | undefined>;

export interface FiltersPopoverProps {
    /** Configuração dos filtros */
    filters: FilterConfig[];
    /** Valores atuais dos filtros */
    values: FilterValues;
    /** Callback quando um filtro muda */
    onChange: (key: string, value: string | DateRangeValue | undefined) => void;
    /** Callback para limpar todos os filtros */
    onClear?: () => void;
    /** Se está desabilitado */
    disabled?: boolean;
    /** Alinhamento do popover */
    align?: 'start' | 'center' | 'end';
    /** Largura do popover */
    width?: number;
    /** Mostrar contador de filtros ativos */
    showBadge?: boolean;
    /** Texto do botão (opcional) */
    buttonText?: string;
    /** Variante do botão */
    buttonVariant?: 'default' | 'outline' | 'ghost';
    /** Tamanho do botão */
    buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
    /** Classes adicionais para o botão */
    buttonClassName?: string;
}

// ============================================
// COMPONENTE
// ============================================

export function FiltersPopover({
    filters,
    values,
    onChange,
    onClear,
    disabled = false,
    align = 'end',
    width = 300,
    showBadge = true,
    buttonText,
    buttonVariant = 'outline',
    buttonSize = 'default',
    buttonClassName,
}: FiltersPopoverProps) {
    const [open, setOpen] = useState(false);

    // Conta quantos filtros estão ativos (diferentes do default)
    const activeFiltersCount = filters.reduce((count, filter) => {
        const value = values[filter.key];
        
        if (filter.type === 'select') {
            const defaultVal = filter.defaultValue || filter.options[0]?.value;
            if (value && value !== defaultVal) return count + 1;
        }
        
        if (filter.type === 'date-range') {
            const dateValue = value as DateRangeValue | undefined;
            if (dateValue?.from || dateValue?.to) return count + 1;
        }
        
        return count;
    }, 0);

    const hasActiveFilters = activeFiltersCount > 0;

    // Renderiza um filtro do tipo select
    const renderSelectFilter = (filter: FilterSelectConfig) => {
        const currentValue = (values[filter.key] as string) || filter.defaultValue || filter.options[0]?.value;
        const selectedOption = filter.options.find(opt => opt.value === currentValue);

        return (
            <div key={filter.key} className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                    {filter.label}
                </Label>
                <Select
                    value={currentValue}
                    onValueChange={(value) => onChange(filter.key, value)}
                    disabled={disabled || filter.loading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={filter.placeholder}>
                            {selectedOption?.label}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    };

    // Renderiza um filtro do tipo date-range
    const renderDateRangeFilter = (filter: FilterDateRangeConfig) => {
        const currentValue = values[filter.key] as DateRangeValue | undefined;

        return (
            <div key={filter.key} className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                    {filter.label}
                </Label>
                <DateRangePickerField
                    value={currentValue}
                    onChange={(value) => onChange(filter.key, value)}
                    placeholder={filter.placeholder || 'Selecionar período'}
                    disabled={disabled}
                    showClear
                    triggerClassName="w-full"
                />
            </div>
        );
    };

    // Renderiza o filtro baseado no tipo
    const renderFilter = (filter: FilterConfig) => {
        switch (filter.type) {
            case 'select':
                return renderSelectFilter(filter);
            case 'date-range':
                return renderDateRangeFilter(filter);
            default:
                return null;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={buttonVariant}
                    size={buttonSize}
                    disabled={disabled}
                    className={cn(
                        "relative shrink-0 gap-2",
                        buttonSize === 'icon' && "h-10 w-10",
                        buttonClassName
                    )}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    {buttonText && <span>{buttonText}</span>}
                    
                    {/* Badge de filtros ativos */}
                    {showBadge && hasActiveFilters && (
                        <span className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-semibold rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            
            <PopoverContent 
                className="p-0" 
                align={align}
                style={{ width }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="text-sm font-medium">Filtros</span>
                    {hasActiveFilters && onClear && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onClear();
                            }}
                            className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Limpar
                        </Button>
                    )}
                </div>

                {/* Filtros */}
                <div className="p-4 space-y-4">
                    {filters.map(renderFilter)}
                </div>

                {/* Footer com contador */}
                {hasActiveFilters && (
                    <div className="px-4 py-3 border-t bg-muted/30">
                        <p className="text-xs text-muted-foreground text-center">
                            {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}
                        </p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

export default FiltersPopover;
