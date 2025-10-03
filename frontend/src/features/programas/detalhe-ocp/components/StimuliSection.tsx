import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { ProgramDetail } from '../types';

interface StimuliSectionProps {
    program: ProgramDetail;
}

export default function StimuliSection({ program }: StimuliSectionProps) {
    const activeStimuli = program.stimuli.filter((stimulus) => stimulus.active);
    const archivedStimuli = program.stimuli.filter((stimulus) => !stimulus.active);

    const getStimulusStatusBadge = (status: 'active' | 'archived') => {
        const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
        const statusClasses =
            status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';

        return (
            <span className={`${baseClasses} ${statusClasses}`}>
                {status === 'active' ? 'Ativo' : 'Arquivado'}
            </span>
        );
    };

    return (
        <Card className="rounded-[5px] px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Objetivo a Curto Prazo
                </CardTitle>

                {/* Descrição detalhada do objetivo a curto prazo */}
                {program.goalDescription && (
                    <div className="space-y-3 mt-4">
                        <Label className="text-sm font-medium">
                            Descrição detalhada do objetivo a curto prazo
                        </Label>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {program.goalDescription}
                            </p>
                        </div>
                    </div>
                )}

                {/* Descrição de Aplicação */}
                {program.stimuliApplicationDescription && (
                    <div className="space-y-3 mt-4">
                        <Label className="text-sm font-medium">
                            Descrição da Aplicação
                        </Label>
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {program.stimuliApplicationDescription}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Esta descrição é aplicada a todos os estímulos do programa.
                        </p>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pb-3 sm:pb-6">
                <div className="space-y-4">
                    {/* Estímulos ativos */}
                    {activeStimuli.length > 0 && (
                        <div className="space-y-3">
                            {activeStimuli.map((stimulus, index) => (
                                <div
                                    key={stimulus.id}
                                    className="flex items-center gap-3 p-3 border border-border rounded-md"
                                >
                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{stimulus.label}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {getStimulusStatusBadge('active')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Estímulos arquivados */}
                    {archivedStimuli.length > 0 && (
                        <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                Estímulos arquivados
                            </h4>
                            <div className="space-y-3">
                                {archivedStimuli.map((stimulus) => (
                                    <div
                                        key={stimulus.id}
                                        className="flex items-center gap-3 p-3 border border-border rounded-md opacity-70"
                                    >
                                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                                            {stimulus.order}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{stimulus.label}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {getStimulusStatusBadge('archived')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {program.stimuli.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum estímulo cadastrado ainda.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
