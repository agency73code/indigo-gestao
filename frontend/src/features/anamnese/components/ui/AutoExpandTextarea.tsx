import { useRef, useEffect, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface AutoExpandTextareaProps {
    label: string;
    description?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    className?: string;
}

export default function AutoExpandTextarea({
    label,
    description,
    placeholder = 'Sua resposta',
    value,
    onChange,
    required = false,
    className,
}: AutoExpandTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize o textarea conforme o conteúdo
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        adjustHeight();
    };

    return (
        <div className={cn('space-y-1', className)}>
            {/* Label */}
            <label className="text-sm font-medium text-foreground">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            
            {/* Descrição opcional */}
            {description && (
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            )}
            
            {/* Textarea com estilo Google Forms */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows={1}
                className={cn(
                    'w-full resize-none overflow-hidden',
                    'bg-transparent border-0 border-b-2 border-muted-foreground/30',
                    'py-2 px-0 text-sm text-foreground',
                    'placeholder:text-muted-foreground/50',
                    'focus:outline-none focus:border-primary',
                    'transition-colors duration-200'
                )}
            />
        </div>
    );
}
