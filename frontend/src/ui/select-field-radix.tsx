import * as React from 'react';
import { cn } from '../lib/utils';
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface SelectFieldRadixProps {
    label: string;
    error?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    children: React.ReactNode;
}

const SelectFieldRadix = React.forwardRef<HTMLButtonElement, SelectFieldRadixProps>(
    ({ label, error, value, onValueChange, placeholder, disabled, children }, ref) => {
        // Quebra o label para destacar o asterisco em vermelho
        const labelParts = label.split('*');
        const hasAsterisk = labelParts.length > 1;

        return (
            <div className="relative w-full">
                <div
                    className={cn(
                        'flex flex-col h-[60px] w-full rounded-lg border border-input bg-card px-4 pt-2 pb-3 shadow-sm transition-all overflow-visible',
                        'focus-within:outline-none focus-within:border-ring focus-within:shadow-[0_0_0_1px_hsl(var(--ring))]',
                        error && 'border-destructive'
                    )}
                >
                    <label className="text-xs font-medium text-muted-foreground mb-1 pointer-events-none">
                        {labelParts[0]}
                        {hasAsterisk && <span className="text-destructive">*</span>}
                        {labelParts[1]}
                    </label>
                    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                        <SelectTrigger
                            ref={ref}
                            className="h-[20px] p-0 border-0 shadow-none focus:ring-0 text-sm font-normal bg-transparent"
                        >
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>{children}</SelectContent>
                    </Select>
                </div>
                {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>
        );
    }
);
SelectFieldRadix.displayName = 'SelectFieldRadix';

export { SelectFieldRadix };
export { SelectItem } from '@/components/ui/select';
