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
        <div className={`${className}`}>
            <div className="px-4 py-2 border border-input bg-background rounded-lg space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
                <div className={`text-sm ${isPlaceholder ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {displayValue}
                </div>
            </div>
        </div>
    );
}
