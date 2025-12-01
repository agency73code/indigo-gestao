import { Trash2, ChevronUp, ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { StimulusInput } from '../types';

interface StimulusRowProps {
    stimulus: StimulusInput;
    index: number;
    totalItems: number;
    onChange: (id: string, field: keyof StimulusInput, value: any) => void;
    onRemove: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    showDescription?: boolean;
    errors?: {
        label?: string;
        description?: string;
    };
}

export default function StimulusRow({
    stimulus,
    index,
    totalItems,
    onChange,
    onRemove,
    onMoveUp,
    onMoveDown,
    showDescription = false,
    errors,
}: StimulusRowProps) {
    const canMoveUp = index > 0;
    const canMoveDown = index < totalItems - 1;

    return (
        <div className="border border-border rounded-lg bg-muted/30 p-4 space-y-4">
            {/* Header com número e ações */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border border-border">
                        #{index + 1}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange(stimulus.id!, 'active', !stimulus.active)}
                        className="h-8 px-2 gap-1"
                        aria-label={`${stimulus.active ? 'Desativar' : 'Ativar'} estímulo ${index + 1}`}
                    >
                        {stimulus.active ? (
                            <>
                                <ToggleRight className="h-4 w-4 text-green-600" />
                                <span className="text-xs text-green-600">Ativo</span>
                            </>
                        ) : (
                            <>
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Inativo</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveUp(stimulus.id!)}
                        disabled={!canMoveUp}
                        className="h-8 w-8 p-0"
                        aria-label={`Mover estímulo ${index + 1} para cima`}
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveDown(stimulus.id!)}
                        disabled={!canMoveDown}
                        className="h-8 w-8 p-0"
                        aria-label={`Mover estímulo ${index + 1} para baixo`}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(stimulus.id!)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        aria-label={`Remover estímulo ${index + 1}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Campos */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label
                        htmlFor={`stimulus-label-${stimulus.id}`}
                        className="text-sm font-medium"
                    >
                        Componente de Desempenho/Tarefa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id={`stimulus-label-${stimulus.id}`}
                        placeholder="Ex: Imitação vocal"
                        value={stimulus.label}
                        onChange={(e) => onChange(stimulus.id!, 'label', e.target.value)}
                        maxLength={60}
                        className={errors?.label ? 'border-destructive' : ''}
                        aria-invalid={!!errors?.label}
                        aria-describedby={
                            errors?.label ? `stimulus-label-error-${stimulus.id}` : undefined
                        }
                    />
                    {errors?.label && (
                        <p
                            id={`stimulus-label-error-${stimulus.id}`}
                            className="text-sm text-destructive"
                        >
                            {errors.label}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {stimulus.label.length}/60 caracteres
                    </p>
                </div>

                {showDescription && (
                    <div className="space-y-2">
                        <Label
                            htmlFor={`stimulus-description-${stimulus.id}`}
                            className="text-sm font-medium"
                        >
                            Descrição do objetivo específico
                        </Label>
                        <textarea
                            id={`stimulus-description-${stimulus.id}`}
                            placeholder="Descreva como esta atividade será realizada, materiais necessários, instruções específicas..."
                            value={stimulus.description || ''}
                            onChange={(e) => onChange(stimulus.id!, 'description', e.target.value)}
                            maxLength={500}
                            rows={3}
                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            aria-invalid={!!errors?.description}
                            aria-describedby={
                                errors?.description ? `stimulus-description-error-${stimulus.id}` : undefined
                            }
                        />
                        {errors?.description && (
                            <p
                                id={`stimulus-description-error-${stimulus.id}`}
                                className="text-sm text-destructive"
                            >
                                {errors.description}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {(stimulus.description || '').length}/500 caracteres
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
