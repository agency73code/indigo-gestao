import { cn } from '../lib/utils';
import { TimeField } from '@/common/components/layout/TimeField';

interface TimeFieldWithLabelProps {
    label: string;
    value?: string;
    onChange: (time: string) => void;
    placeholder?: string;
    error?: string;
    className?: string;
    clearable?: boolean;
    disabled?: boolean;
}

export function TimeFieldWithLabel({
    label,
    error,
    className,
    placeholder = 'Selecione',
    ...props
}: TimeFieldWithLabelProps) {
    // Quebra o label para destacar o asterisco em vermelho
    const labelParts = label.split('*');
    const hasAsterisk = labelParts.length > 1;

    return (
        <div className={cn("relative w-full", className)}>
            <div
                className={cn(
                    'flex flex-col min-h-[60px] w-full rounded-lg border border-input bg-card px-4 pt-2 pb-2 shadow-sm transition-all',
                    'focus-within:outline-none focus-within:border-ring focus-within:shadow-[0_0_0_1px_hsl(var(--ring))]',
                    error && 'border-destructive',
                )}
            >
                <label className="text-xs font-medium text-muted-foreground mb-1 pointer-events-none">
                    {labelParts[0]}
                    {hasAsterisk && <span className="text-destructive">*</span>}
                    {labelParts[1]}
                </label>
                <TimeField
                    {...props}
                    placeholder={placeholder}
                    error={undefined}
                    inputClassName="!border-0 !shadow-none !bg-transparent h-7 !p-0 text-sm font-normal !ring-0 focus-visible:!ring-0 hover:!bg-transparent [&_svg]:mr-2"
                />
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    );
}
