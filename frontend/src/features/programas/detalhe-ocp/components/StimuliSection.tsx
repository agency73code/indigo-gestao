import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className="rounded-[5px] px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Objetivo a Curto Prazo
                </CardTitle>

                {shortTermGoalDescription && (
                    <div className="space-y-3 mt-4">
                        <Label className="text-sm font-medium mb-1">
                            Descri??o detalhada do objetivo a curto prazo:
                        </Label>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {shortTermGoalDescription}
                            </p>
                        </div>
                    </div>
                )}

                {applicationDescription && applicationDescription.trim().length > 0 && (
                    <div className="space-y-3 mt-4">
                        <Label className="text-sm font-medium mb-1">Descri??o da Aplica??o</Label>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {applicationDescription}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Esta descri??o ? aplicada a todos os est?mulos do programa.
                        </p>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pb-3 sm:pb-6">
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
                        <div className="border-t pt-4">
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
