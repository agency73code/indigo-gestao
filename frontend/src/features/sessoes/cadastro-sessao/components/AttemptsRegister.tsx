import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionAttempt } from '../types';

interface AttemptsRegisterProps {
    attempts: SessionAttempt[];
}

export default function AttemptsRegister({ attempts }: AttemptsRegisterProps) {
    const getAttemptIcon = (type: SessionAttempt['type']) => {
        const icons = {
            error: '✗',
            prompted: '✋',
            independent: '✓',
        };
        return icons[type];
    };

    const getAttemptColors = (type: SessionAttempt['type']) => {
        const colors = {
            error: 'bg-red-100 text-red-700 border-red-200',
            prompted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            independent: 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[type];
    };

    if (attempts.length === 0) {
        return (
            <Card className="rounded-[5px] p-1 sm:p-4">
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Registros da Sessão
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma tentativa registrada ainda</p>
                        <p className="text-sm mt-1">Selecione um estímulo acima para começar</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[5px] p-1 sm:p-4">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Registros da Sessão
                    <span className="text-sm font-normal text-muted-foreground">
                        ({attempts.length})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-4">
                    {/* Grid de tentativas */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2 overflow-x-auto">
                        {attempts.map((attempt, index) => (
                            <Card
                                key={attempt.id}
                                className={`relative border-2 rounded-[5px] ${getAttemptColors(attempt.type)} flex-shrink-0`}
                            >
                                <CardContent className="p-3 text-center">
                                    {/* Número da tentativa */}
                                    <div className="text-xs font-medium mb-1">#{index + 1}</div>

                                    {/* Ícone do resultado */}
                                    <div className="text-lg font-bold">
                                        {getAttemptIcon(attempt.type)}
                                    </div>

                                    {/* Label do estímulo (opcional, truncado) */}
                                    <div
                                        className="text-xs mt-1 truncate"
                                        title={attempt.stimulusLabel}
                                    >
                                        {attempt.stimulusLabel}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Legenda */}
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                            <span className="text-red-600">✗</span>
                            <span>ERRO</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-600">✋</span>
                            <span>AJUDA</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-green-600">✓</span>
                            <span>INDEP.</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
