import { Label } from '@/ui/label';

interface ReadOnlyFieldProps {
    label: string;
    value?: string | number;
    placeholder?: string;
    className?: string;
}

export default function ReadOnlyField({
    label,
    value,
    placeholder = 'Não informado',
    className = '',
}: ReadOnlyFieldProps) {
    const displayValue = value ?? placeholder;
    const isPlaceholder = !value;

    return (
        <div className={`space-y-2 ${className}`}>
            <Label className="text-sm font-medium text-foreground">{label}</Label>
            <div
                className={`min-h-[40px] px-3 py-2 border border-input bg-muted/50 rounded-md text-sm ${
                    isPlaceholder ? 'text-muted-foreground italic' : 'text-foreground'
                }`}
            >
                {displayValue}
            </div>
        </div>
    );
}
