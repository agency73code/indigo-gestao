import { cn } from '../lib/utils';
import { DateField } from '@/common/components/layout/DateField';

interface DateFieldWithLabelProps {
    label: string;
    value?: string | Date | null;
    onChange: (iso: string) => void;
    placeholder?: string;
    error?: string;
    minDate?: Date;
    maxDate?: Date;
    disabled?: (date: Date) => boolean;
    className?: string;
    clearable?: boolean;
}

export function DateFieldWithLabel({
    label,
    error,
    className,
    ...props
}: DateFieldWithLabelProps) {
    // Quebra o label para destacar o asterisco em vermelho
    const labelParts = label.split('*');
    const hasAsterisk = labelParts.length > 1;

    return (
        <div className="relative w-full">
            <div
                className={cn(
                    'flex flex-col h-[60px] w-full rounded-lg border border-input bg-card px-4 pt-2 pb-3 shadow-sm transition-all overflow-visible',
                    'focus-within:outline-none focus-within:border-ring focus-within:shadow-[0_0_0_1px_hsl(var(--ring))]',
                    error && 'border-destructive',
                    className
                )}
            >
                <label className="text-xs font-medium text-muted-foreground mb-1 pointer-events-none">
                    {labelParts[0]}
                    {hasAsterisk && <span className="text-destructive">*</span>}
                    {labelParts[1]}
                </label>
                <DateField
                    {...props}
                    error={undefined}
                    inputClassName="border-0 shadow-none bg-transparent h-auto p-0 text-sm font-normal hover:bg-transparent focus-visible:ring-0"
                />
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    );
}
