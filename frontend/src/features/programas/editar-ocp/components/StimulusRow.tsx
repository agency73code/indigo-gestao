import { ChevronUp, ChevronDown, Trash2, ToggleLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { ValidationErrors } from '../types';

interface StimulusRowProps {
    stimulus: {
        id?: string;
        label: string;
        description?: string | null;
        active: boolean;
        order: number;
    };
    index: number;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onLabelChange: (index: number, label: string) => void;
    onDescriptionChange: (index: number, description: string) => void;
    onActiveChange: (index: number, active: boolean) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onRemove: (index: number) => void;
    errors?: ValidationErrors['stimuli'];
}

export default function StimulusRow({
    stimulus,
    index,
    canMoveUp,
    canMoveDown,
    onLabelChange,
    onDescriptionChange,
    onActiveChange,
    onMoveUp,
    onMoveDown,
    onRemove,
    errors,
}: StimulusRowProps) {
    const stimulusError = errors?.[index];

    return (
        <Card className="rounded-[5px]">
            <CardContent className="p-4 space-y-4">
                {/* Header com número e controles */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                            {index + 1}
                        </span>

                        {/* Toggle de ativo/inativo */}
                        <Button
                            variant={stimulus.active ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onActiveChange(index, !stimulus.active)}
                            className="h-6 text-xs"
                            aria-label={`${stimulus.active ? 'Desativar' : 'Ativar'} estímulo ${index + 1}`}
                        >
                            <ToggleLeft className="h-3 w-3 mr-1" />
                            {stimulus.active ? 'Ativo' : 'Inativo'}
                        </Button>
                    </div>

                    {/* Controles de movimento e remoção */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMoveUp(index)}
                            disabled={!canMoveUp}
                            className="h-8 w-8 p-0"
                            aria-label={`Mover estímulo ${index + 1} para cima`}
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMoveDown(index)}
                            disabled={!canMoveDown}
                            className="h-8 w-8 p-0"
                            aria-label={`Mover estímulo ${index + 1} para baixo`}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(index)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            aria-label={`Remover estímulo ${index + 1}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Campo do label */}
                <div className="space-y-2">
                    <Label htmlFor={`stimulus-label-${index}`}>Nome do estímulo *</Label>
                    <Input
                        id={`stimulus-label-${index}`}
                        placeholder="Ex: Identificação de objetos"
                        value={stimulus.label}
                        onChange={(e) => onLabelChange(index, e.target.value)}
                        maxLength={60}
                        className={stimulusError?.label ? 'border-red-500' : ''}
                    />
                    {stimulusError?.label && (
                        <p className="text-sm text-red-600">{stimulusError.label}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {stimulus.label.length}/60 caracteres
                    </p>
                </div>

                {/* Campo da descrição */}
                <div className="space-y-2">
                    <Label htmlFor={`stimulus-description-${index}`}>Descrição (opcional)</Label>
                    <textarea
                        id={`stimulus-description-${index}`}
                        placeholder="Descreva como trabalhar este estímulo..."
                        value={stimulus.description || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            onDescriptionChange(index, e.target.value)
                        }
                        maxLength={1000}
                        className="w-full p-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                        rows={3}
                    />
                    {stimulusError?.description && (
                        <p className="text-sm text-red-600">{stimulusError.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {(stimulus.description || '').length}/1000 caracteres
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
