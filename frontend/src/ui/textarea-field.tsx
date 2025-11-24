import * as React from 'react';
import { cn } from '../lib/utils';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    required?: boolean;
}

const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
    ({ label, error, required, className, ...props }, ref) => {
        // Quebra o label para destacar o asterisco em vermelho
        const labelParts = label.split('*');
        const hasAsterisk = labelParts.length > 1 || required;

        return (
            <div className="relative w-full">
                <div
                    className={cn(
                        'flex flex-col h-auto w-full rounded-lg border border-input bg-card px-4 pt-2 pb-3 shadow-sm transition-all',
                        'focus-within:border-ring focus-within:shadow-[0_0_0_1px_hsl(var(--ring))]',
                        error && 'border-destructive'
                    )}
                >
                    {/* Detalhe visual no canto inferior direito */}
                    <div className="absolute bottom-2 right-2 w-3 h-3 pointer-events-none">
                        <svg
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full"
                        >
                            <path
                                d="M6 12L12 6"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinecap="round"
                                className="text-muted-foreground/20"
                            />
                            <path
                                d="M9 12L12 9"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinecap="round"
                                className="text-muted-foreground/20"
                            />
                        </svg>
                    </div>

                    <label className="text-xs font-medium text-muted-foreground mb-1 pointer-events-none">
                        {required ? label.replace('*', '').trim() : labelParts[0]}
                        {hasAsterisk && <span className="text-destructive">*</span>}
                        {!required && labelParts[1]}
                    </label>
                    <textarea
                        ref={ref}
                        className={cn(
                            'min-h-[100px] w-full bg-transparent text-sm font-normal placeholder:text-muted-foreground',
                            'focus:outline-none focus:ring-0 resize-none',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>
        );
    }
);
TextAreaField.displayName = 'TextAreaField';

export { TextAreaField };
