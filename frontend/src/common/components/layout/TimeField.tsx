'use client';

import * as React from 'react';
import { Clock, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Props = {
    /** valor em formato HH:mm (ex: "14:30") */
    value?: string;
    /** retorna HH:mm */
    onChange: (time: string) => void;
    placeholder?: string;
    error?: string;
    className?: string;
    /** se true, mostra botão para limpar o horário */
    clearable?: boolean;
    /** classes customizadas para o input/button interno */
    inputClassName?: string;
    disabled?: boolean;
};

export function TimeField({
    value,
    onChange,
    placeholder = 'Selecione um horário',
    error,
    className,
    clearable = false,
    inputClassName,
    disabled = false,
}: Props) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [isInputMode, setIsInputMode] = React.useState(false);

    const display = value || '';

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

    // Função para aplicar máscara de horário
    const applyTimeMask = (value: string) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');

        // Aplica a máscara progressivamente
        if (numbers.length <= 2) {
            return numbers;
        } else if (numbers.length <= 4) {
            return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
        } else {
            // Limita a 4 dígitos
            return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
        }
    };

    const validateTime = (timeString: string): boolean => {
        if (timeString.length !== 5) return false;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const maskedValue = applyTimeMask(rawValue);
        setInputValue(maskedValue);

        // Validar e aplicar apenas se estiver completo e válido
        if (maskedValue.length === 5 && validateTime(maskedValue)) {
            onChange(maskedValue);
        }
    };

    const handleInputBlur = () => {
        setIsInputMode(false);
        // Se não conseguiu fazer parse válido, volta para o valor original
        if (!validateTime(inputValue)) {
            setInputValue(display);
        }
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

    // Gerar opções de horário (de 00:00 a 23:30, intervalos de 30 minutos)
    const timeOptions = React.useMemo(() => {
        const options: string[] = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hour = h.toString().padStart(2, '0');
                const minute = m.toString().padStart(2, '0');
                options.push(`${hour}:${minute}`);
            }
        }
        return options;
    }, []);

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
                                placeholder="00:00"
                                className={cn(
                                    'w-full',
                                    error && 'border-destructive',
                                    inputClassName,
                                )}
                                maxLength={5}
                                autoFocus
                                disabled={disabled}
                            />
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={disabled}
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !value && 'text-muted-foreground',
                                    error && 'border-destructive',
                                    clearable && value && 'pr-12',
                                    inputClassName,
                                )}
                                onClick={() => {
                                    if (!disabled) {
                                        setIsInputMode(true);
                                        setInputValue(display || '');
                                    }
                                }}
                            >
                                <Clock className="mr-4 h-4 w-4" />
                                {display || placeholder}
                            </Button>
                        )}

                        {/* Botão de limpar */}
                        {clearable && value && !isInputMode && !disabled && (
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
                <PopoverContent className="p-0 w-auto" align="start">
                    <div className="max-h-[240px] overflow-y-auto p-2">
                        <div className="grid gap-1">
                            {timeOptions.map((time) => (
                                <Button
                                    key={time}
                                    type="button"
                                    variant={value === time ? 'default' : 'ghost'}
                                    className="justify-start font-normal h-8"
                                    onClick={() => {
                                        onChange(time);
                                        setOpen(false);
                                        setIsInputMode(false);
                                    }}
                                >
                                    {time}
                                </Button>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
