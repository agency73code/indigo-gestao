import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionAttempt } from '../types';

interface AttemptsRegisterProps {
    attempts: SessionAttempt[];
}

export default function AttemptsRegister({ attempts }: AttemptsRegisterProps) {
    const getAttemptIcon = (type: SessionAttempt['type']) => {
        const icons = {
            error: <span className="text-3xl text-red-600">✗</span>,
            prompted: <span className="text-3xl text-yellow-600">✋</span>,
            independent: <span className="text-3xl text-green-600">✓</span>,
        };
        return icons[type];
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
                        {attempts.map((attempt, idx) => (
                            <div
                                key={attempt.id}
                                className="relative flex items-center justify-center h-20 bg-white border rounded-[5px]"
                            >
                                <span className="absolute top-1 left-2 text-xs text-muted-foreground font-medium">
                                    {idx + 1}
                                </span>
                                {getAttemptIcon(attempt.type)}
                            </div>
                        ))}
                    </div>

                    {/* Legenda */}
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1">
                            <span className="text-red-600">✗</span> ERRO
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="text-yellow-600">✋</span> AJUDA
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="text-green-600">✓</span> INDEP.
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
