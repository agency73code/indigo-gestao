import { Toggle } from '@/components/ui/toggle';
import { Label } from '@/components/ui/label';

interface SwitchFieldProps {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}

export function SwitchField({
    id,
    label,
    description,
    checked,
    onCheckedChange,
    disabled = false,
}: SwitchFieldProps) {
    return (
        <div className="flex items-start justify-between space-x-4">
            <div className="flex-1">
                <Label htmlFor={id} className="text-sm font-medium text-foreground">
                    {label}
                </Label>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
            <Toggle
                id={id}
                pressed={checked}
                onPressedChange={onCheckedChange}
                disabled={disabled}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-[5px]"
                size="sm"
            >
                {checked ? 'On' : 'Off'}
            </Toggle>
        </div>
    );
}
