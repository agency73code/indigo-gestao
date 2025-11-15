import * as React from 'react';
import { cn } from '../lib/utils';

interface InputFieldProps extends React.ComponentProps<'input'> {
    label: string;
    error?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({ className, label, error, ...props }, ref) => {
        // Quebra o label para destacar o asterisco em vermelho
        const labelParts = label.split('*');
        const hasAsterisk = labelParts.length > 1;

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
                    <input
                        className="text-sm font-normal text-foreground bg-card border-0 outline-none p-0 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground/60 autofill:bg-card autofill:text-foreground"
                        style={{
                            WebkitTextFillColor: 'inherit',
                        }}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>
        );
    }
);
InputField.displayName = 'InputField';

export { InputField };
