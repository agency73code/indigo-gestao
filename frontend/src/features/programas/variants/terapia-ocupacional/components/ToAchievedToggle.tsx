// Toggle com 4 opções: Sim | Não | Parcial | Não se aplica
// Componente específico para TO (conseguiu realizar o objetivo?)

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import type { ToAchieved } from '../types';

interface ToAchievedToggleProps {
    value: ToAchieved | null;
    onChange: (value: ToAchieved) => void;
    error?: string;
    required?: boolean;
}

export default function ToAchievedToggle({
    value,
    onChange,
    error,
    required = false,
}: ToAchievedToggleProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="to-achieved" className="text-sm font-medium">
                O cliente conseguiu realizar o objetivo?
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            
            <ToggleGroup
                type="single"
                value={value || ''}
                onValueChange={(val) => {
                    if (val) onChange(val as ToAchieved);
                }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full"
                id="to-achieved"
                aria-invalid={!!error}
                aria-describedby={error ? 'to-achieved-error' : 'to-achieved-helper'}
            >
                <ToggleGroupItem 
                    value="sim" 
                    className="data-[state=on]:bg-green-100 data-[state=on]:text-green-900 dark:data-[state=on]:bg-green-900/30 dark:data-[state=on]:text-green-100"
                >
                    ✓ Sim
                </ToggleGroupItem>
                <ToggleGroupItem 
                    value="nao"
                    className="data-[state=on]:bg-red-100 data-[state=on]:text-red-900 dark:data-[state=on]:bg-red-900/30 dark:data-[state=on]:text-red-100"
                >
                    ✗ Não
                </ToggleGroupItem>
                <ToggleGroupItem 
                    value="parcial"
                    className="data-[state=on]:bg-yellow-100 data-[state=on]:text-yellow-900 dark:data-[state=on]:bg-yellow-900/30 dark:data-[state=on]:text-yellow-100"
                >
                    ~ Parcial
                </ToggleGroupItem>
                <ToggleGroupItem 
                    value="nao_aplica"
                    className="data-[state=on]:bg-gray-100 data-[state=on]:text-gray-900 dark:data-[state=on]:bg-gray-900/30 dark:data-[state=on]:text-gray-100"
                >
                    ø N.A.
                </ToggleGroupItem>
            </ToggleGroup>

            <p 
                id="to-achieved-helper" 
                className="text-xs text-muted-foreground"
            >
                Selecione a opção mais fiel ao desempenho de hoje.
            </p>

            {error && (
                <p 
                    id="to-achieved-error" 
                    className="text-xs text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
