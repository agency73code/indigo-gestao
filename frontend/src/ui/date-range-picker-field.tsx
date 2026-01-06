/**
 * DateRangePickerField
 * 
 * Componente reutilizável para seleção de intervalo de datas.
 * Usa Popover + Calendar com mode="range" para seleção visual.
 * 
 * @example
 * ```tsx
 * <DateRangePickerField
 *   label="Período"
 *   value={{ from: '2025-01-01', to: '2025-01-31' }}
 *   onChange={(range) => console.log(range)}
 *   placeholder="Selecione o período"
 * />
 * ```
 */

import * as React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

// Tipo para o valor do componente (datas em formato ISO string)
export interface DateRangeValue {
    from?: string; // ISO date string (yyyy-MM-dd)
    to?: string;   // ISO date string (yyyy-MM-dd)
}

export interface DateRangePickerFieldProps {
    /** Label do campo */
    label?: string;
    /** Valor atual (datas em formato ISO) */
    value?: DateRangeValue;
    /** Callback quando o valor muda */
    onChange?: (value: DateRangeValue | undefined) => void;
    /** Placeholder quando não há valor */
    placeholder?: string;
    /** Classe CSS adicional */
    className?: string;
    /** Se o campo está desabilitado */
    disabled?: boolean;
    /** Número de meses a exibir (1 ou 2) */
    numberOfMonths?: 1 | 2;
    /** Se deve mostrar botão de limpar */
    showClear?: boolean;
    /** Alinhamento do popover */
    align?: 'start' | 'center' | 'end';
    /** Largura mínima do trigger */
    triggerClassName?: string;
}

/**
 * Converte DateRangeValue (ISO strings) para DateRange (Date objects)
 */
function toDateRange(value?: DateRangeValue): DateRange | undefined {
    if (!value) return undefined;
    
    const from = value.from ? parseISO(value.from) : undefined;
    const to = value.to ? parseISO(value.to) : undefined;
    
    // Valida se as datas são válidas
    const validFrom = from && isValid(from) ? from : undefined;
    const validTo = to && isValid(to) ? to : undefined;
    
    if (!validFrom && !validTo) return undefined;
    
    return { from: validFrom, to: validTo };
}

/**
 * Converte DateRange (Date objects) para DateRangeValue (ISO strings)
 */
function toDateRangeValue(range?: DateRange): DateRangeValue | undefined {
    if (!range) return undefined;
    
    return {
        from: range.from ? format(range.from, 'yyyy-MM-dd') : undefined,
        to: range.to ? format(range.to, 'yyyy-MM-dd') : undefined,
    };
}

/**
 * Formata o intervalo para exibição
 */
function formatDateRange(value?: DateRangeValue): string {
    if (!value?.from) return '';
    
    const from = parseISO(value.from);
    const fromFormatted = isValid(from) 
        ? format(from, 'dd/MM/yyyy', { locale: ptBR }) 
        : '';
    
    if (!value.to) {
        return fromFormatted;
    }
    
    const to = parseISO(value.to);
    const toFormatted = isValid(to) 
        ? format(to, 'dd/MM/yyyy', { locale: ptBR }) 
        : '';
    
    return `${fromFormatted} - ${toFormatted}`;
}

export function DateRangePickerField({
    label,
    value,
    onChange,
    placeholder = 'Selecione o período',
    className,
    disabled = false,
    numberOfMonths = 1,
    showClear = true,
    align = 'start',
    triggerClassName,
}: DateRangePickerFieldProps) {
    const [open, setOpen] = React.useState(false);
    
    // Converte value (ISO strings) para DateRange (Date objects)
    const dateRange = toDateRange(value);
    
    // Handler para mudança de seleção
    const handleSelect = React.useCallback((range: DateRange | undefined) => {
        onChange?.(toDateRangeValue(range));
    }, [onChange]);
    
    // Handler para limpar
    const handleClear = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(undefined);
    }, [onChange]);
    
    const displayValue = formatDateRange(value);
    const hasValue = !!value?.from;
    
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            {label && (
                <Label className="text-sm font-medium text-foreground">
                    {label}
                </Label>
            )}
            
            <div className="relative">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            disabled={disabled}
                            className={cn(
                                'justify-start text-left font-normal w-full',
                                !hasValue && 'text-muted-foreground',
                                showClear && hasValue && 'pr-8',
                                triggerClassName
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                            <span className="flex-1 truncate">
                                {hasValue ? displayValue : placeholder}
                            </span>
                        </Button>
                    </PopoverTrigger>
                <PopoverContent 
                    className="p-0" 
                    align={align}
                >
                    <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={handleSelect}
                        numberOfMonths={numberOfMonths}
                        locale={ptBR}
                        initialFocus
                    />
                </PopoverContent>
                </Popover>
                
                {/* Botão de limpar - fora do PopoverTrigger para não abrir o calendário */}
                {showClear && hasValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm opacity-50 hover:opacity-100 hover:bg-muted transition-opacity"
                        aria-label="Limpar período"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default DateRangePickerField;
