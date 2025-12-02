import { Plus, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import StimulusRow from './StimulusRow';
import type { ValidationErrors } from '../types';

interface StimuliEditorProps {
    stimuli: {
        id?: string;
        label: string;
        description?: string | null;
        active: boolean;
        order: number;
    }[];
    shortTermGoalDescription: string;
    stimuliApplicationDescription: string;
    onStimuliChange: (
        stimuli: {
            id?: string;
            label: string;
            description?: string | null;
            active: boolean;
            order: number;
        }[],
    ) => void;
    onShortTermGoalDescriptionChange: (description: string) => void;
    onStimuliApplicationDescriptionChange: (description: string) => void;
    errors?: ValidationErrors;
}

export default function StimuliEditor({
    stimuli,
    shortTermGoalDescription,
    stimuliApplicationDescription,
    onStimuliChange,
    onShortTermGoalDescriptionChange,
    onStimuliApplicationDescriptionChange,
    errors,
}: StimuliEditorProps) {
    const handleAddStimulus = () => {
        const newStimulus = {
            label: '',
            description: '',
            active: true,
            order: stimuli.length + 1,
        };

        onStimuliChange([...stimuli, newStimulus]);
    };

    const handleRemoveStimulus = (index: number) => {
        const newStimuli = stimuli.filter((_, i) => i !== index);
        // Reordenar após remoção
        const reorderedStimuli = newStimuli.map((stimulus, i) => ({
            ...stimulus,
            order: i + 1,
        }));

        onStimuliChange(reorderedStimuli);
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;

        const newStimuli = [...stimuli];
        [newStimuli[index - 1], newStimuli[index]] = [newStimuli[index], newStimuli[index - 1]];

        // Atualizar order
        const reorderedStimuli = newStimuli.map((stimulus, i) => ({
            ...stimulus,
            order: i + 1,
        }));

        onStimuliChange(reorderedStimuli);
    };

    const handleMoveDown = (index: number) => {
        if (index === stimuli.length - 1) return;

        const newStimuli = [...stimuli];
        [newStimuli[index], newStimuli[index + 1]] = [newStimuli[index + 1], newStimuli[index]];

        // Atualizar order
        const reorderedStimuli = newStimuli.map((stimulus, i) => ({
            ...stimulus,
            order: i + 1,
        }));

        onStimuliChange(reorderedStimuli);
    };

    const handleLabelChange = (index: number, label: string) => {
        const newStimuli = [...stimuli];
        newStimuli[index] = { ...newStimuli[index], label };
        onStimuliChange(newStimuli);
    };

    const handleActiveChange = (index: number, active: boolean) => {
        const newStimuli = [...stimuli];
        newStimuli[index] = { ...newStimuli[index], active };
        onStimuliChange(newStimuli);
    };

    return (
        <Card padding="small" className="rounded-[5px]">
            <CardHeader className="pb-2 sm:pb-3 pt-0 sm:pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Objetivo do Programa a Curto Prazo
                    </CardTitle>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleAddStimulus}
                        className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0"
                        aria-label="Adicionar estímulo"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {errors?.general && (
                    <p className="text-sm text-destructive mt-2">{errors.general}</p>
                )}

                {/* Descrição detalhada do objetivo a curto prazo */}
                <div className="space-y-3 mt-4">
                    <Label htmlFor="goal-description" className="text-sm font-medium">
                        Descrição detalhada do objetivo a curto prazo:
                    </Label>
                    <textarea
                        id="goal-description"
                        placeholder="Descreva mais detalhadamente o que se espera alcançar com este programa..."
                        value={shortTermGoalDescription}
                        onChange={(e) => onShortTermGoalDescriptionChange(e.target.value)}
                        maxLength={1000}
                        rows={3}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    {errors?.shortTermGoalDescription && (
                        <p className="text-sm text-destructive">{errors.shortTermGoalDescription}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {shortTermGoalDescription.length}/1000 caracteres
                    </p>
                </div>

                {/* Descrição de Aplicação */}
                <div className="space-y-3 mt-4">
                    <Label
                        htmlFor="stimuli-application-description"
                        className="text-sm font-medium"
                    >
                        Descrição da Aplicação
                    </Label>
                    <textarea
                        id="stimuli-application-description"
                        placeholder="Descreva detalhes gerais sobre como aplicar os estímulos deste programa..."
                        value={stimuliApplicationDescription}
                        onChange={(e) => onStimuliApplicationDescriptionChange(e.target.value)}
                        maxLength={1000}
                        rows={3}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    {errors?.stimuliApplicationDescription && (
                        <p className="text-sm text-destructive">
                            {errors.stimuliApplicationDescription}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {stimuliApplicationDescription.length}/1000 caracteres
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Esta descrição será aplicada a todos os estímulos do programa.
                    </p>
                </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="space-y-4 px-">
                    {stimuli.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground mb-4">
                                Nenhum estímulo adicionado ainda.
                            </p>
                            <Button onClick={handleAddStimulus} variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar primeiro estímulo
                            </Button>
                        </div>
                    ) : (
                        stimuli.map((stimulus, index) => (
                            <StimulusRow
                                key={`stimulus-${index}`}
                                stimulus={stimulus}
                                index={index}
                                canMoveUp={index > 0}
                                canMoveDown={index < stimuli.length - 1}
                                onLabelChange={handleLabelChange}
                                onActiveChange={handleActiveChange}
                                onMoveUp={handleMoveUp}
                                onMoveDown={handleMoveDown}
                                onRemove={handleRemoveStimulus}
                                errors={errors?.stimuli}
                            />
                        ))
                    )}

                    {stimuli.length > 0 && (
                        <Button
                            type="button"
                            onClick={handleAddStimulus}
                            className="w-full flex items-center gap-2 mt-4 h-12 rounded-[5px]"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar outro Estímulo
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
