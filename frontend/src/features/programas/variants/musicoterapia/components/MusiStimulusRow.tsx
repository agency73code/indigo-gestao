import { ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MusiStimulus } from '../types';

interface MusiStimulusRowProps {
    stimulus: MusiStimulus;
    index: number;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onObjetivoChange: (index: number, value: string) => void;
    onObjetivoEspecificoChange: (index: number, value: string) => void;
    onMetodosChange: (index: number, value: string) => void;
    onTecnicasProcedimentosChange: (index: number, value: string) => void;
    onActiveChange: (index: number, active: boolean) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onRemove: (index: number) => void;
}

export default function MusiStimulusRow({
    stimulus,
    index,
    canMoveUp,
    canMoveDown,
    onObjetivoChange,
    onObjetivoEspecificoChange,
    onMetodosChange,
    onTecnicasProcedimentosChange,
    onActiveChange,
    onMoveUp,
    onMoveDown,
    onRemove,
}: MusiStimulusRowProps) {
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
                        onClick={() => onActiveChange(index, !stimulus.active)}
                        className="h-8 px-2 gap-1"
                        aria-label={`${stimulus.active ? 'Desativar' : 'Ativar'} objetivo ${index + 1}`}
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
                        onClick={() => onMoveUp(index)}
                        disabled={!canMoveUp}
                        className="h-8 w-8 p-0"
                        aria-label={`Mover objetivo ${index + 1} para cima`}
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveDown(index)}
                        disabled={!canMoveDown}
                        className="h-8 w-8 p-0"
                        aria-label={`Mover objetivo ${index + 1} para baixo`}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        aria-label={`Remover objetivo ${index + 1}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Campos */}
            <div className="space-y-4">
                {/* Grid com 2 colunas para Objetivo e Objetivo Específico */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campo Objetivo */}
                    <div className="space-y-2">
                        <Label htmlFor={`musi-objetivo-${index}`} className="text-sm font-medium">
                            Objetivo <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id={`musi-objetivo-${index}`}
                            placeholder="Ex: Compreender conceitos"
                            value={stimulus.objetivo}
                            onChange={(e) => onObjetivoChange(index, e.target.value)}
                            maxLength={100}
                            className="h-9"
                        />
                        <p className="text-xs text-muted-foreground">
                            {stimulus.objetivo.length}/100 caracteres
                        </p>
                    </div>

                    {/* Campo Objetivo Específico */}
                    <div className="space-y-2">
                        <Label htmlFor={`musi-objetivo-especifico-${index}`} className="text-sm font-medium">
                            Objetivo Específico <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id={`musi-objetivo-especifico-${index}`}
                            placeholder="Ex: Identificar direita e esquerda"
                            value={stimulus.objetivoEspecifico}
                            onChange={(e) => onObjetivoEspecificoChange(index, e.target.value)}
                            maxLength={200}
                            className="h-9"
                        />
                        <p className="text-xs text-muted-foreground">
                            {stimulus.objetivoEspecifico.length}/200 caracteres
                        </p>
                    </div>
                </div>

                {/* Campo Métodos */}
                <div className="space-y-2">
                    <Label htmlFor={`musi-metodos-${index}`} className="text-sm font-medium">
                        Métodos
                    </Label>
                    <Input
                        id={`musi-metodos-${index}`}
                        placeholder="Ex: Recriação – Jogos e atividades musicais"
                        value={stimulus.metodos}
                        onChange={(e) => onMetodosChange(index, e.target.value)}
                        maxLength={200}
                        className="h-9"
                    />
                    <p className="text-xs text-muted-foreground">
                        {stimulus.metodos.length}/200 caracteres
                    </p>
                </div>

                {/* Campo Técnicas/Procedimentos */}
                <div className="space-y-2">
                    <Label htmlFor={`musi-tecnicas-${index}`} className="text-sm font-medium">
                        Técnicas/Procedimentos
                    </Label>
                    <textarea
                        id={`musi-tecnicas-${index}`}
                        placeholder="Descreva as técnicas e procedimentos a serem utilizados..."
                        value={stimulus.tecnicasProcedimentos}
                        onChange={(e) => onTecnicasProcedimentosChange(index, e.target.value)}
                        maxLength={1000}
                        rows={3}
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        {stimulus.tecnicasProcedimentos.length}/1000 caracteres
                    </p>
                </div>
            </div>
        </div>
    );
}
