import { Brain, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    onStimuliChange: (
        stimuli: {
            id?: string;
            label: string;
            description?: string | null;
            active: boolean;
            order: number;
        }[],
    ) => void;
    errors?: ValidationErrors;
}

export default function StimuliEditor({ stimuli, onStimuliChange, errors }: StimuliEditorProps) {
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

    const handleDescriptionChange = (index: number, description: string) => {
        const newStimuli = [...stimuli];
        newStimuli[index] = { ...newStimuli[index], description };
        onStimuliChange(newStimuli);
    };

    const handleActiveChange = (index: number, active: boolean) => {
        const newStimuli = [...stimuli];
        newStimuli[index] = { ...newStimuli[index], active };
        onStimuliChange(newStimuli);
    };

    return (
        <Card className="rounded-[5px]">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Estímulos ({stimuli.length})
                    </CardTitle>
                    <Button onClick={handleAddStimulus} size="sm" className="h-8">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-4">
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
                                onDescriptionChange={handleDescriptionChange}
                                onActiveChange={handleActiveChange}
                                onMoveUp={handleMoveUp}
                                onMoveDown={handleMoveDown}
                                onRemove={handleRemoveStimulus}
                                errors={errors?.stimuli}
                            />
                        ))
                    )}

                    {stimuli.length > 0 && (
                        <div className="pt-2">
                            <Button
                                onClick={handleAddStimulus}
                                variant="outline"
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar outro estímulo
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
