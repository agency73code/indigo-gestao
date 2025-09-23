import { Plus, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StimulusRow from './StimulusRow';
import type { StimulusInput } from '../types';

interface StimuliListProps {
    stimuli: StimulusInput[];
    onChange: (stimuli: StimulusInput[]) => void;
    errors?: {
        stimuli?: string;
        stimulusErrors?: { [key: string]: { label?: string } };
    };
}

export default function StimuliList({ stimuli, onChange, errors }: StimuliListProps) {
    const generateId = () => `stimulus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const handleAddStimulus = () => {
        const newStimulus: StimulusInput = {
            id: generateId(),
            label: '',
            description: '',
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
            const clearedStimulus = stimuli.map((s) =>
                s.id === id ? { ...s, label: '', description: '' } : s,
            );
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
        <Card padding="none" className="rounded-[5px] px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Estímulos do Programa
                    </CardTitle>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddStimulus}
                        className="h-8 px-2 gap-1 text-xs sm:text-sm"
                    >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        
                    </Button>
                </div>
                {errors?.stimuli && (
                    <p className="text-sm text-destructive mt-2">{errors.stimuli}</p>
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
                                variant="outline"
                                size="sm"
                                onClick={handleAddStimulus}
                                className="mt-3"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar primeiro estímulo
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
                                errors={errors?.stimulusErrors?.[stimulus.id!]}
                            />
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
