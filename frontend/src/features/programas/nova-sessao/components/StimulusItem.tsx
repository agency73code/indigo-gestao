import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ProgramDetail, SessionAttempt } from '../types';

interface StimulusItemProps {
    stimulus: ProgramDetail['stimuli'][0];
    attempts: SessionAttempt[];
    onAddAttempt: (stimulusId: string, stimulusLabel: string) => void;
}

export default function StimulusItem({ stimulus, attempts, onAddAttempt }: StimulusItemProps) {
    // Contar tentativas para este estímulo
    const stimulusAttempts = attempts.filter((attempt) => attempt.stimulusId === stimulus.id);
    const attemptCount = stimulusAttempts.length;
    const maxAttempts = 20;

    // Calcular estatísticas básicas deste estímulo
    const independentCount = stimulusAttempts.filter((a) => a.type === 'independent').length;
    const accuracyRate = attemptCount > 0 ? Math.round((independentCount / attemptCount) * 100) : 0;

    const handleAddAttempt = () => {
        if (attemptCount >= maxAttempts) return;
        onAddAttempt(stimulus.id, stimulus.label);
    };

    return (
        <Card className="rounded-[5px] border">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {/* Número do estímulo */}
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                        {stimulus.order}
                    </div>

                    {/* Conteúdo do estímulo */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm text-foreground mb-1">
                                    {stimulus.label}
                                </h3>
                                {stimulus.description && (
                                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                                        {stimulus.description}
                                    </p>
                                )}

                                {/* Estatísticas do estímulo */}
                                {attemptCount > 0 && (
                                    <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                                        <span>
                                            Tentativas: {attemptCount}/{maxAttempts}
                                        </span>
                                        <span>Acertos: {accuracyRate}%</span>
                                    </div>
                                )}
                            </div>

                            {/* Botão de adicionar tentativa */}
                            <Button
                                size="sm"
                                onClick={handleAddAttempt}
                                disabled={attemptCount >= maxAttempts}
                                className="flex-shrink-0 h-8 px-3 text-xs"
                            >
                                <Play className="h-3 w-3 mr-1" />
                                {attemptCount === 0 ? 'Iniciar' : 'Registrar'}
                            </Button>
                        </div>

                        {/* Preview das últimas tentativas */}
                        {attemptCount > 0 && (
                            <div className="flex gap-1 flex-wrap">
                                {stimulusAttempts.slice(-5).map((attempt, index) => {
                                    const icons = {
                                        error: '✗',
                                        prompted: '✋',
                                        independent: '✓',
                                    };
                                    const colors = {
                                        error: 'text-red-600',
                                        prompted: 'text-yellow-600',
                                        independent: 'text-green-600',
                                    };

                                    return (
                                        <span
                                            key={`${attempt.id}-${index}`}
                                            className={`text-xs ${colors[attempt.type]}`}
                                            title={`Tentativa ${attempt.attemptNumber}: ${attempt.type}`}
                                        >
                                            {icons[attempt.type]}
                                        </span>
                                    );
                                })}
                                {stimulusAttempts.length > 5 && (
                                    <span className="text-xs text-muted-foreground">
                                        +{stimulusAttempts.length - 5}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Aviso de limite */}
                        {attemptCount >= maxAttempts && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Limite de tentativas atingido
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
