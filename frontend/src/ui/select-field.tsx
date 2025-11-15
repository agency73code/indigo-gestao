import * as React from 'react';
import { cn } from '../lib/utils';

interface SelectFieldProps extends React.ComponentProps<'select'> {
    label: string;
    error?: string;
    children: React.ReactNode;
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
    ({ className, label, error, children, value, ...props }, ref) => {
        // Quebra o label para destacar o asterisco em vermelho
        const labelParts = label.split('*');
        const hasAsterisk = labelParts.length > 1;
        
        // Verifica se o valor está vazio para aplicar estilo de placeholder
        const isEmpty = !value || value === '';

        return (
            <div className="relative w-full">
                <div
                    className={cn(
                        'flex flex-col h-auto w-full rounded-lg border border-input bg-card px-4 pt-2 pb-3 shadow-sm transition-all overflow-visible',
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
                    <select
                        className={cn(
                            "text-sm font-normal bg-card border-0 outline-none p-0 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
                            isEmpty ? "text-muted-foreground" : "text-foreground"
                        )}
                        ref={ref}
                        value={value}
                        {...props}
                    >
                        {children}
                    </select>
                    {/* Seta customizada */}
                    <svg
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M2.5 4.5L6 8L9.5 4.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>
        );
    }
);
SelectField.displayName = 'SelectField';

export { SelectField };
