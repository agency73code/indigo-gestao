import { cn } from '../lib/utils';
import { Combobox } from '@/ui/combobox';

interface ComboboxOption {
    value: string;
    label: string;
    searchValue?: string;
}

interface ComboboxFieldProps {
    label: string;
    options: ComboboxOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    error?: string;
    disabled?: boolean;
}

export function ComboboxField({
    label,
    options,
    value,
    onValueChange,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    error,
    disabled,
}: ComboboxFieldProps) {
    // Quebra o label para destacar o asterisco em vermelho
    const labelParts = label.split('*');
    const hasAsterisk = labelParts.length > 1;

    return (
        <div className="relative w-full">
            <div
                className={cn(
                    'flex flex-col h-full w-full rounded-lg border border-input bg-card px-4 pt-2 pb-3 shadow-sm transition-all overflow-visible',
                    'focus-within:outline-none focus-within:border-ring focus-within:shadow-[0_0_0_1px_hsl(var(--ring))]',
                    error && 'border-destructive'
                )}
            >
                <label className="text-xs font-medium text-muted-foreground mb-1 pointer-events-none">
                    {labelParts[0]}
                    {hasAsterisk && <span className="text-destructive">*</span>}
                    {labelParts[1]}
                </label>
                <Combobox
                    options={options}
                    value={value}
                    onValueChange={onValueChange}
                    placeholder={placeholder}
                    searchPlaceholder={searchPlaceholder}
                    emptyMessage={emptyMessage}
                    error={!!error}
                    disabled={disabled}
                    className="border-0 shadow-none h-auto p-0 focus-visible:ring-0"
                />
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    );
}
