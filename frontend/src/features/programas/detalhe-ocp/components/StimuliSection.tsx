import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import StimulusRow from './StimulusRow';
import type { ProgramDetail } from '../types';

interface StimuliSectionProps {
    program: ProgramDetail;
}

export default function StimuliSection({ program }: StimuliSectionProps) {
    const shortTermGoalDescription =
        program.shortTermGoalDescription ?? program.goalDescription ?? null;

    const applicationDescription = program.stimuliApplicationDescription ?? null;

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
                    Objetivo do Programa a Curto Prazo
                </CardTitleHub>

                {shortTermGoalDescription && (
                    <div className="space-y-3 mt-4">
                        <Label className="text-sm font-medium mb-1">
                            Descrição detalhada do objetivo a curto prazo:
                        </Label>
                        <div 
                            className="p-4 border border-border/40 dark:border-white/15 rounded-lg"
                            style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                        >
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {shortTermGoalDescription}
                            </p>
                        </div>
                    </div>
                )}

                {applicationDescription && applicationDescription.trim().length > 0 && (
                    <div className="space-y-3 mt-4">
                        <Label className="text-sm font-medium mb-1">Descrição da Aplicação</Label>
                        <div 
                            className="p-4 border border-border/40 dark:border-white/15 rounded-lg"
                            style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                        >
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {applicationDescription}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Esta descrição é aplicada a todos os estímulos do programa.
                        </p>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {activeStimuli.length > 0 && (
                        <div className="space-y-3">
                            {activeStimuli.map((stimulus) => (
                                <StimulusRow
                                    key={stimulus.id}
                                    programId={program.id}
                                    stimulus={stimulus}
                                    applicationDescription={applicationDescription}
                                />
                            ))}
                        </div>
                    )}

                    {archivedStimuli.length > 0 && (
                        <div className="border-t border-border/40 dark:border-white/15 pt-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                Est?mulos arquivados
                            </h4>
                            <div className="space-y-3">
                                {archivedStimuli.map((stimulus) => (
                                    <StimulusRow
                                        key={stimulus.id}
                                        programId={program.id}
                                        stimulus={stimulus}
                                        applicationDescription={applicationDescription}
                                        muted
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {program.stimuli.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum est?mulo cadastrado ainda.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
