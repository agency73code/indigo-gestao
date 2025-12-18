import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NumberSpinnerProps {
    value: string;
    onChange: (value: string) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    placeholder?: string;
    suffix?: string;
}

export default function NumberSpinner({
    value,
    onChange,
    min = 0,
    max = 999,
    disabled = false,
    placeholder = '0',
    suffix,
}: NumberSpinnerProps) {
    const numericValue = parseInt(value) || 0;

    const increment = () => {
        if (disabled) return;
        const newValue = Math.min(numericValue + 1, max);
        onChange(newValue.toString());
    };

    const decrement = () => {
        if (disabled) return;
        const newValue = Math.max(numericValue - 1, min);
        onChange(newValue.toString());
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        // Permitir apenas números
        if (inputValue === '' || /^\d+$/.test(inputValue)) {
            const num = parseInt(inputValue) || 0;
            if (num >= min && num <= max) {
                onChange(inputValue);
            } else if (num > max) {
                onChange(max.toString());
            }
        }
    };

    return (
        <div className="flex items-center gap-1">
            <div className="relative flex items-center">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={value}
                    onChange={handleInputChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`
                        w-16 h-9 px-2 pr-7 text-center text-sm
                        border border-input rounded-md
                        bg-background
                        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
                        disabled:opacity-50 disabled:cursor-not-allowed
                        [appearance:textfield]
                        [&::-webkit-outer-spin-button]:appearance-none
                        [&::-webkit-inner-spin-button]:appearance-none
                    `}
                />
                {/* Botões de incremento/decremento */}
                <div className="absolute right-0.5 top-0.5 bottom-0.5 flex flex-col">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={increment}
                        disabled={disabled || numericValue >= max}
                        className="h-4 w-5 p-0 hover:bg-gray-100 rounded-sm"
                        tabIndex={-1}
                    >
                        <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={decrement}
                        disabled={disabled || numericValue <= min}
                        className="h-4 w-5 p-0 hover:bg-gray-100 rounded-sm"
                        tabIndex={-1}
                    >
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                </div>
            </div>
            {suffix && (
                <span className="text-sm text-muted-foreground">{suffix}</span>
            )}
        </div>
    );
}
