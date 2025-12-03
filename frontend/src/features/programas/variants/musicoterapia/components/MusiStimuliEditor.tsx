import { Plus, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import MusiStimulusRow from './MusiStimulusRow';

interface MusiStimuliEditorProps {
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
    errors?: any;
}

export default function MusiStimuliEditor({
    stimuli,
    onStimuliChange,
    errors,
}: MusiStimuliEditorProps) {
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
        <Card padding="small" className="rounded-[5px]">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Objetivo Específico
                    </CardTitle>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleAddStimulus}
                        className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0"
                        aria-label="Adicionar atividade"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {errors?.general && (
                    <p className="text-sm text-destructive mt-2">{errors.general}</p>
                )}
            </CardHeader>

            <CardContent className="pb-3 sm:pb-6">
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Atividades:</Label>

                    {stimuli.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">Nenhuma atividade adicionada ainda.</p>
                            <p className="text-xs mt-1">
                                Clique no botão + acima para adicionar uma atividade.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stimuli.map((stimulus, index) => (
                                <MusiStimulusRow
                                    key={`stimulus-${index}`}
                                    index={index}
                                    stimulus={stimulus}
                                    onLabelChange={handleLabelChange}
                                    onDescriptionChange={handleDescriptionChange}
                                    onActiveChange={handleActiveChange}
                                    onRemove={handleRemoveStimulus}
                                    onMoveUp={handleMoveUp}
                                    onMoveDown={handleMoveDown}
                                    canMoveUp={index > 0}
                                    canMoveDown={index < stimuli.length - 1}
                                />
                            ))}
                        </div>
                    )}

                    {errors?.stimuli && typeof errors.stimuli === 'string' && (
                        <p className="text-sm text-destructive mt-2">{errors.stimuli}</p>
                    )}

                    {stimuli.length > 0 && (
                        <Button
                            type="button"
                            onClick={handleAddStimulus}
                            className="w-full flex items-center gap-2 mt-4 h-12 rounded-[5px]"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar outra Atividade
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
