'use client';

import * as React from 'react';
import { format, isValid, parseISO, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

type Props = {
    /** valor em ISO (yyyy-MM-dd) ou Date. Recomendo ISO no seu estado */
    value?: string | Date | null;
    /** retorna ISO yyyy-MM-dd */
    onChange: (iso: string) => void;
    placeholder?: string;
    error?: string;
    /** restrições opcionais */
    minDate?: Date;
    maxDate?: Date;
    /** desabilitar datas por função (shadcn prop) */
    disabled?: (date: Date) => boolean;
    className?: string;
    /** se true, mostra botão para limpar a data */
    clearable?: boolean;
};

export function DateField({
    value,
    onChange,
    placeholder = 'Selecione uma data',
    error,
    minDate,
    maxDate,
    disabled,
    className,
    clearable = false,
}: Props) {
    // normaliza value -> Date
    let selected: Date | undefined;
    if (value instanceof Date) selected = value;
    else if (typeof value === 'string' && value) {
        const maybe = parseISO(value);
        selected = isValid(maybe) ? maybe : undefined;
    }

    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [isInputMode, setIsInputMode] = React.useState(false);

    const display = selected ? format(selected, 'dd/MM/yyyy', { locale: ptBR }) : '';

    // Atualizar o input quando o valor muda externamente
    React.useEffect(() => {
        if (!isInputMode) {
            setInputValue(display);
        }
    }, [display, isInputMode]);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setInputValue('');
        setIsInputMode(false);
    };

    // Função para aplicar máscara de data
    const applyDateMask = (value: string) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');

        // Aplica a máscara progressivamente
        if (numbers.length <= 2) {
            return numbers;
        } else if (numbers.length <= 4) {
            return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
        } else if (numbers.length <= 8) {
            return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
        } else {
            // Limita a 8 dígitos
            return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const maskedValue = applyDateMask(rawValue);
        setInputValue(maskedValue);

        // Tentar fazer parse da data digitada (apenas se tiver formato completo)
        if (maskedValue.length === 10) {
            // dd/mm/yyyy
            const formats = ['dd/MM/yyyy'];

            for (const formatStr of formats) {
                try {
                    const parsedDate = parse(maskedValue, formatStr, new Date());
                    if (isValid(parsedDate)) {
                        // Verificar se está dentro dos limites
                        if (minDate && parsedDate < minDate) continue;
                        if (maxDate && parsedDate > maxDate) continue;

                        const iso = format(parsedDate, 'yyyy-MM-dd');
                        onChange(iso);
                        return;
                    }
                } catch {
                    // Continuar tentando outros formatos
                }
            }
        }
    };

    const handleInputBlur = () => {
        setIsInputMode(false);
        // Se não conseguiu fazer parse válido, volta para o valor original
        setInputValue(display);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
        if (e.key === 'Escape') {
            setIsInputMode(false);
            setInputValue(display);
        }
    };

    // Definir range para 10 anos no futuro
    const fromYear = minDate ? minDate.getFullYear() : 1900;
    const toYear = maxDate ? maxDate.getFullYear() : new Date().getFullYear() + 10;

    return (
        <div className={cn('relative', className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        {isInputMode ? (
                            <Input
                                value={inputValue}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                onKeyDown={handleInputKeyDown}
                                placeholder="dd/mm/aaaa"
                                className={cn('w-full', error && 'border-destructive')}
                                maxLength={10}
                                autoFocus
                            />
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !selected && 'text-muted-foreground',
                                    error && 'border-destructive',
                                    clearable && selected && 'pr-12',
                                )}
                                onClick={() => {
                                    setIsInputMode(true);
                                    setInputValue(display || '');
                                }}
                            >
                                <CalendarIcon className="mr-4 h-4 w-4" />
                                {display || placeholder}
                            </Button>
                        )}

                        {/* Botão de limpar */}
                        {clearable && selected && !isInputMode && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted z-10"
                                onClick={handleClear}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selected}
                        onSelect={(date) => {
                            if (!date) return;
                            const iso = format(date, 'yyyy-MM-dd');
                            onChange(iso);
                            setOpen(false);
                            setIsInputMode(false);
                        }}
                        locale={ptBR}
                        fromDate={minDate || new Date(fromYear, 0, 1)}
                        toDate={maxDate || new Date(toYear, 11, 31)}
                        disabled={disabled}
                        initialFocus
                        captionLayout="dropdown"
                        startMonth={minDate || new Date(fromYear, 0)}
                        endMonth={maxDate || new Date(toYear, 11)}
                    />
                </PopoverContent>
            </Popover>
            {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
