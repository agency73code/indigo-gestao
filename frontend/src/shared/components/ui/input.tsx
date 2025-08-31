import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <div className="space-y-1">
                <input
                    type={type}
                    className={cn(
                        'flex h-9 w-full rounded-[5px] border border-input bg-transparent px-4 py-5 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                        error && 'border-destructive focus-visible:ring-destructive',
                        className,
                    )}
                    ref={ref}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${props.id}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${props.id}-error`} className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);
Input.displayName = 'Input';

export { Input };
