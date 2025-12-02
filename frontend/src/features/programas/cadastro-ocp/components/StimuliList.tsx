import { Plus, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import StimulusRow from './StimulusRow';
import type { StimulusInput } from '../types';

interface StimuliListProps {
    stimuli: StimulusInput[];
    stimuliApplicationDescription?: string;
    shortTermGoalDescription?: string;
    onChange: (stimuli: StimulusInput[]) => void;
    onApplicationDescriptionChange?: (description: string) => void;
    onShortTermGoalDescriptionChange?: (description: string) => void;
    showDescription?: boolean;
    showApplicationDescription?: boolean;
    customTitle?: string;
    errors?: {
        stimuli?: string;
        stimulusErrors?: { [key: string]: { label?: string; description?: string } };
        stimuliApplicationDescription?: string;
        shortTermGoalDescription?: string;
    };
}

export default function StimuliList({
    stimuli,
    stimuliApplicationDescription = '',
    shortTermGoalDescription = '',
    onChange,
    onApplicationDescriptionChange,
    onShortTermGoalDescriptionChange,
    showDescription = false,
    showApplicationDescription = true,
    customTitle,
    errors,
}: StimuliListProps) {
    const generateId = () => `stimulus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const handleAddStimulus = () => {
        const newStimulus: StimulusInput = {
            id: generateId(),
            label: '',
            active: true,
            order: stimuli.length + 1,
        };

        onChange([...stimuli, newStimulus]);
    };

    const handleStimulusChange = (id: string, field: keyof StimulusInput, value: any) => {
        const updatedStimuli = stimuli.map((stimulus) => {
            if (stimulus.id === id) {
                return { ...stimulus, [field]: value };
            }
            return stimulus;
        });
        onChange(updatedStimuli);
    };

    const handleRemoveStimulus = (id: string) => {
        if (stimuli.length === 1) {
            // Não permite remover o último estímulo, apenas limpa
            const clearedStimulus = stimuli.map((s) => (s.id === id ? { ...s, label: '' } : s));
            onChange(clearedStimulus);
            return;
        }

        const updatedStimuli = stimuli
            .filter((s) => s.id !== id)
            .map((stimulus, index) => ({ ...stimulus, order: index + 1 }));

        onChange(updatedStimuli);
    };

    const handleMoveUp = (id: string) => {
        const index = stimuli.findIndex((s) => s.id === id);
        if (index <= 0) return;

        const newStimuli = [...stimuli];
        [newStimuli[index - 1], newStimuli[index]] = [newStimuli[index], newStimuli[index - 1]];

        // Atualizar orders
        newStimuli.forEach((stimulus, idx) => {
            stimulus.order = idx + 1;
        });

        onChange(newStimuli);
    };

    const handleMoveDown = (id: string) => {
        const index = stimuli.findIndex((s) => s.id === id);
        if (index >= stimuli.length - 1) return;

        const newStimuli = [...stimuli];
        [newStimuli[index], newStimuli[index + 1]] = [newStimuli[index + 1], newStimuli[index]];

        // Atualizar orders
        newStimuli.forEach((stimulus, idx) => {
            stimulus.order = idx + 1;
        });

        onChange(newStimuli);
    };

    return (
        <Card padding="none" className="rounded-lg px-4 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-0 sm:pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        {customTitle || 'Objetivo do Programa a Curto Prazo'}
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
                {errors?.stimuli && (
                    <p className="text-sm text-destructive mt-2">{errors.stimuli}</p>
                )}

                {showApplicationDescription && (
                    <>
                        {/* Descrição detalhada do objetivo a curto prazo */}
                        <div className="space-y-3">
                            <Label htmlFor="goal-description" className="text-sm font-medium">
                                Descrição detalhada do objetivo a curto prazo:
                            </Label>
                            
                            <textarea
                                id="goal-description"
                                placeholder="Descreva mais detalhadamente o que se espera alcançar com este objetivo..."
                                value={shortTermGoalDescription}
                                onChange={(e) => onShortTermGoalDescriptionChange?.(e.target.value)}
                                maxLength={1000}
                                rows={3}
                                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                            {errors?.shortTermGoalDescription && (
                                <p className="text-sm text-destructive">{errors.shortTermGoalDescription}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {shortTermGoalDescription.length}/1000 caracteres
                            </p>
                        </div>

                        {/* Descrição de Aplicação */}
                        <div className="space-y-3">
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
                                onChange={(e) => onApplicationDescriptionChange?.(e.target.value)}
                                maxLength={1000}
                                rows={3}
                                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                            {errors?.stimuliApplicationDescription && (
                                <p className="text-sm text-destructive">
                                    {errors.stimuliApplicationDescription}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {stimuliApplicationDescription.length}/1000 caracteres
                            </p>
                        </div>
                    </>
                )}
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="space-y-4">
                    {stimuli.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum estímulo adicionado</p>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleAddStimulus}
                                className="mt-3 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0"
                                aria-label="Adicionar primeiro estímulo"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        stimuli.map((stimulus, index) => (
                            <StimulusRow
                                key={stimulus.id}
                                stimulus={stimulus}
                                index={index}
                                totalItems={stimuli.length}
                                onChange={handleStimulusChange}
                                onRemove={handleRemoveStimulus}
                                onMoveUp={handleMoveUp}
                                onMoveDown={handleMoveDown}
                                showDescription={showDescription}
                                errors={errors?.stimulusErrors?.[stimulus.id!]}
                            />
                        ))
                    )}

                    {stimuli.length > 0 && (
                        <Button
                            type="button"
                            onClick={handleAddStimulus}
                            className="w-full flex items-center gap-2 mt-4 h-12 rounded-full"
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
