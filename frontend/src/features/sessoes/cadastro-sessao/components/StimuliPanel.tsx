import { useState } from 'react';
import { Brain, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AttemptPicker from './AttemptPicker';
import type { ProgramDetail, SessionAttempt, SessionAttemptType } from '../types';

interface StimuliPanelProps {
    program: ProgramDetail;
    attempts: SessionAttempt[];
    onAddAttempt: (attempt: SessionAttempt) => void;
}

export default function StimuliPanel({ program, attempts, onAddAttempt }: StimuliPanelProps) {

    const [expanded, setExpanded] = useState<string | null>(null);
    const [attemptPicker, setAttemptPicker] = useState<{ isOpen: boolean; stimulusId: string; stimulusLabel: string }>({ isOpen: false, stimulusId: '', stimulusLabel: '' });

    // Filtrar apenas estímulos ativos
    const activeStimuli = program.stimuli.filter((stimulus) => stimulus.active);

    const handleExpand = (stimulusId: string) => {
        setExpanded(expanded === stimulusId ? null : stimulusId);
    };

    const handleAddAttempt = (stimulusId: string, stimulusLabel: string) => {
        setAttemptPicker({ isOpen: true, stimulusId, stimulusLabel });
    };

    const handleAttemptTypeSelect = (type: SessionAttemptType) => {
        const { stimulusId, stimulusLabel } = attemptPicker;
        const stimulusAttempts = attempts.filter((attempt) => attempt.stimulusId === stimulusId);
        const attemptNumber = stimulusAttempts.length + 1;
        const newAttempt: SessionAttempt = {
            id: `attempt-${Date.now()}-${Math.random()}`,
            attemptNumber,
            stimulusId,
            stimulusLabel,
            type,
            timestamp: new Date().toISOString(),
        };
        onAddAttempt(newAttempt);
        setAttemptPicker({ isOpen: false, stimulusId: '', stimulusLabel: '' });
    };

    const handleCloseAttemptPicker = () => {
        setAttemptPicker({ isOpen: false, stimulusId: '', stimulusLabel: '' });
    };

    if (activeStimuli.length === 0) {
        return (
            <Card className="rounded-[5px] p-1 sm:p-4">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Estímulos em treino
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum estímulo ativo encontrado para este programa</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="rounded-[5px] p-1 sm:p-4">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Estímulos em treino
                        <span className="text-sm font-normal text-muted-foreground">
                            ({activeStimuli.length})
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="space-y-3">
                        {activeStimuli.map((stimulus) => (
                            <div key={stimulus.id}>
                                <button
                                    type="button"
                                    className={`w-full text-left rounded-[8px] border bg-white hover:bg-muted transition flex items-center px-4 py-3 gap-4 ${expanded === stimulus.id ? 'bg-muted' : ''}`}
                                    onClick={() => handleExpand(stimulus.id)}
                                >
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                                        {stimulus.order}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm mb-1">{stimulus.label}</div>
                                        <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Ativo</span>
                                    </div>
                                    <div className="ml-auto">
                                        <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className={`transition-transform ${expanded === stimulus.id ? 'rotate-90' : ''}`}><path d="M7 8l3 3 3-3" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </div>
                                </button>
                                {expanded === stimulus.id && (
                                    <div className="px-4 pb-4 pt-2 bg-muted rounded-b-[8px]">
                                        {stimulus.description && (
                                            <div className="text-xs text-muted-foreground mb-2 leading-relaxed">
                                                {stimulus.description}
                                            </div>
                                        )}
                                        <div className="flex justify-end">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAddAttempt(stimulus.id, stimulus.label)}
                                                className="h-8 px-3 text-xs"
                                            >
                                                <Play className="h-3 w-3 mr-1" />
                                                Iniciar
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <AttemptPicker
                isOpen={attemptPicker.isOpen}
                stimulusLabel={attemptPicker.stimulusLabel}
                onClose={handleCloseAttemptPicker}
                onSelect={handleAttemptTypeSelect}
            />
        </>
    );
}
