import { ChevronUp, ChevronDown, ToggleLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface ToStimulusRowProps {
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
}

export default function ToStimulusRow({
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
}: ToStimulusRowProps) {
    return (
        <Card padding="small" className="rounded-[5px]">
            <CardContent className="p-4 space-y-3">
                {/* Cabeçalho com número, status e controles */}
                <div className="flex items-center justify-between">
                    {/* Número do estímulo */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                            {index + 1}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onActiveChange(index, !stimulus.active)}
                            className={`h-8 px-3 text-xs ${
                                stimulus.active
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <ToggleLeft className="h-4 w-4 mr-1" />
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
                            aria-label={`Mover atividade ${index + 1} para cima`}
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMoveDown(index)}
                            disabled={!canMoveDown}
                            className="h-8 w-8 p-0"
                            aria-label={`Mover atividade ${index + 1} para baixo`}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            aria-label={`Remover atividade ${index + 1}`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Campo do nome da atividade */}
                <div className="space-y-2">
                    <Label htmlFor={`stimulus-label-${index}`}>Nome da Atividade *</Label>
                    <Input
                        id={`stimulus-label-${index}`}
                        placeholder="Ex: Vestir camiseta"
                        value={stimulus.label}
                        onChange={(e) => onLabelChange(index, e.target.value)}
                        maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                        {stimulus.label.length}/60 caracteres
                    </p>
                </div>

                {/* Campo de descrição da atividade */}
                <div className="space-y-2">
                    <Label htmlFor={`stimulus-description-${index}`}>Descrição da Atividade</Label>
                    <textarea
                        id={`stimulus-description-${index}`}
                        placeholder="Descreva como realizar esta atividade..."
                        value={stimulus.description || ''}
                        onChange={(e) => onDescriptionChange(index, e.target.value)}
                        maxLength={500}
                        rows={3}
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        {(stimulus.description || '').length}/500 caracteres
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
