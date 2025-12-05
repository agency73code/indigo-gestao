import { Plus, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MusiStimulusRow from './MusiStimulusRow';
import type { MusiStimulus } from '../types';

interface MusiStimuliEditorProps {
    stimuli: MusiStimulus[];
    onStimuliChange: (stimuli: MusiStimulus[]) => void;
    errors?: any;
}

export default function MusiStimuliEditor({
    stimuli,
    onStimuliChange,
    errors,
}: MusiStimuliEditorProps) {
    const handleAddStimulus = () => {
        const newStimulus: MusiStimulus = {
            objetivo: '',
            objetivoEspecifico: '',
            metodos: '',
            tecnicasProcedimentos: '',
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

    const handleObjetivoChange = (index: number, value: string) => {
        const newStimuli = [...stimuli];
        newStimuli[index] = { ...newStimuli[index], objetivo: value };
        onStimuliChange(newStimuli);
    };

    const handleObjetivoEspecificoChange = (index: number, value: string) => {
        const newStimuli = [...stimuli];
        newStimuli[index] = { ...newStimuli[index], objetivoEspecifico: value };
        onStimuliChange(newStimuli);
    };

    const handleMetodosChange = (index: number, value: string) => {
        const newStimuli = [...stimuli];
        newStimuli[index] = { ...newStimuli[index], metodos: value };
        onStimuliChange(newStimuli);
    };

    const handleTecnicasProcedimentosChange = (index: number, value: string) => {
        const newStimuli = [...stimuli];
        newStimuli[index] = { ...newStimuli[index], tecnicasProcedimentos: value };
        onStimuliChange(newStimuli);
    };

    const handleActiveChange = (index: number, active: boolean) => {
        const newStimuli = [...stimuli];
        newStimuli[index] = { ...newStimuli[index], active };
        onStimuliChange(newStimuli);
    };

    return (
        <Card padding="none" className="rounded-lg px-4 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
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
                        aria-label="Adicionar objetivo específico"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {errors?.stimuli && (
                    <p className="text-sm text-destructive mt-2">{errors.stimuli}</p>
                )}
            </CardHeader>

            <CardContent className="pb-3 sm:pb-6">
                <div className="space-y-3">
                    {stimuli.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum objetivo específico adicionado</p>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleAddStimulus}
                                className="mt-3 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0"
                                aria-label="Adicionar primeiro objetivo específico"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stimuli.map((stimulus, index) => (
                                <MusiStimulusRow
                                    key={`musi-stimulus-${stimulus.id || index}`}
                                    index={index}
                                    stimulus={stimulus}
                                    onObjetivoChange={handleObjetivoChange}
                                    onObjetivoEspecificoChange={handleObjetivoEspecificoChange}
                                    onMetodosChange={handleMetodosChange}
                                    onTecnicasProcedimentosChange={handleTecnicasProcedimentosChange}
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
                            className="w-full flex items-center gap-2 mt-4 h-12 rounded-full"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar outro Objetivo Específico
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
