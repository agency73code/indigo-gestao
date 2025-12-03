import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import MusiStimulusRowDetail from './MusiStimulusRowDetail';

interface MusiStimuliSectionProps {
    program: {
        id: string;
        shortTermGoalDescription?: string | null;
        stimuli: {
            id: string;
            order: number;
            label: string;
            description?: string | null;
            active: boolean;
        }[];
    };
}

export default function MusiStimuliSection({ program }: MusiStimuliSectionProps) {
    const activeStimuli = [...program.stimuli]
        .filter((stimulus) => stimulus.active)
        .sort((a, b) => a.order - b.order);

    const archivedStimuli = [...program.stimuli]
        .filter((stimulus) => !stimulus.active)
        .sort((a, b) => a.order - b.order);

    return (
        <Card 
            padding="hub"
            className="rounded-lg border-0 shadow-none" 
            style={{ backgroundColor: 'var(--hub-card-background)' }}
            data-print-block
        >
            <CardHeader className="pb-3">
                <CardTitleHub className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Objetivo Específico
                </CardTitleHub>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {activeStimuli.length > 0 && (
                        <div className="space-y-3">
                            {activeStimuli.map((stimulus) => (
                                <MusiStimulusRowDetail
                                    key={stimulus.id}
                                    programId={program.id}
                                    stimulus={stimulus}
                                />
                            ))}
                        </div>
                    )}

                    {archivedStimuli.length > 0 && (
                        <div className="border-t border-border/40 dark:border-white/15 pt-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                Atividades arquivadas
                            </h4>
                            <div className="space-y-3">
                                {archivedStimuli.map((stimulus) => (
                                    <MusiStimulusRowDetail
                                        key={stimulus.id}
                                        programId={program.id}
                                        stimulus={stimulus}
                                        muted
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {program.stimuli.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma atividade cadastrada ainda.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
