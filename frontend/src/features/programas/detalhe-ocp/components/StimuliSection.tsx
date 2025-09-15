import { useState } from 'react';
import { Brain, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ProgramDetail } from '../types';

interface StimuliSectionProps {
    program: ProgramDetail;
}

export default function StimuliSection({ program }: StimuliSectionProps) {
    const [expandedStimuli, setExpandedStimuli] = useState<Record<string, boolean>>({});

    const toggleStimulus = (stimulusId: string) => {
        setExpandedStimuli((prev) => ({
            ...prev,
            [stimulusId]: !prev[stimulusId],
        }));
    };

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
        <Card className="rounded-[5px] p-1 sm:p-4">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Estímulos em treino
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-3">
                    {/* Estímulos ativos */}
                    {activeStimuli.map((stimulus, index) => (
                        <Collapsible
                            key={stimulus.id}
                            open={expandedStimuli[stimulus.id] || false}
                            onOpenChange={() => toggleStimulus(stimulus.id)}
                        >
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between h-auto p-3 border border-border rounded-md hover:bg-muted/50"
                                >
                                    <div className="flex items-start gap-3 text-left">
                                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{stimulus.label}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getStimulusStatusBadge('active')}
                                            </div>
                                        </div>
                                    </div>
                                    {expandedStimuli[stimulus.id] ? (
                                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2">
                                {stimulus.description && (
                                    <div className="pl-9 pr-8 pb-2">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {stimulus.description}
                                        </p>
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}

                    {/* Estímulos arquivados */}
                    {archivedStimuli.length > 0 && (
                        <>
                            <div className="border-t pt-3 mt-4">
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                    Estímulos arquivados
                                </h4>
                                {archivedStimuli.map((stimulus) => (
                                    <Collapsible
                                        key={stimulus.id}
                                        open={expandedStimuli[stimulus.id] || false}
                                        onOpenChange={() => toggleStimulus(stimulus.id)}
                                    >
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-between h-auto p-3 border border-border rounded-md hover:bg-muted/50 opacity-70"
                                            >
                                                <div className="flex items-start gap-3 text-left">
                                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                                                        {stimulus.order}
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {stimulus.label}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {getStimulusStatusBadge('archived')}
                                                        </div>
                                                    </div>
                                                </div>
                                                {expandedStimuli[stimulus.id] ? (
                                                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                                )}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-2">
                                            {stimulus.description && (
                                                <div className="pl-9 pr-8 pb-2">
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {stimulus.description}
                                                    </p>
                                                </div>
                                            )}
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        </>
                    )}

                    {program.stimuli.length === 0 && (
                        <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground">
                                Nenhum estímulo cadastrado ainda.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
