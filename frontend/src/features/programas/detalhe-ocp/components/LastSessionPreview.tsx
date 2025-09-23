import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionListItem } from '../types';

interface LastSessionPreviewProps {
    lastSession: SessionListItem | null;
}

export default function LastSessionPreview({ lastSession }: LastSessionPreviewProps) {
    if (!lastSession || !lastSession.preview) {
        return null;
    }

    const getResultSymbol = (result: 'error' | 'prompted' | 'independent') => {
        switch (result) {
            case 'error':
                return '✗';
            case 'prompted':
                return '✋';
            case 'independent':
                return '✓';
            default:
                return '?';
        }
    };

    const getResultColor = (result: 'error' | 'prompted' | 'independent') => {
        switch (result) {
            case 'error':
                return 'text-red-600';
            case 'prompted':
                return 'text-yellow-600';
            case 'independent':
                return 'text-green-600';
            default:
                return 'text-gray-400';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    return (
        <Card padding="md" className="rounded-[5px]">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Última sessão ({formatDate(lastSession.date)})
                </CardTitle>
            </CardHeader>
            <CardContent className=" pb-3 sm:pb-6">
                {/* Grade de resultados */}
                <div className="space-y-3">
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {lastSession.preview.map((result, index) => (
                            <div
                                key={index}
                                className="aspect-square flex items-center justify-center border border-border rounded text-lg font-bold"
                                title={`Tentativa ${index + 1}: ${
                                    result === 'error'
                                        ? 'Erro'
                                        : result === 'prompted'
                                          ? 'Com ajuda'
                                          : 'Independente'
                                }`}
                            >
                                <span className={getResultColor(result)}>
                                    {getResultSymbol(result)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Legenda */}
                    <div className="flex justify-center">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                            <div className="flex items-center gap-1">
                                <span className="text-red-600 font-bold">✗</span>
                                <span>ERRO</span>
                            </div>
                            <span>·</span>
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-600 font-bold">✋</span>
                                <span>AJUDA</span>
                            </div>
                            <span>·</span>
                            <div className="flex items-center gap-1">
                                <span className="text-green-600 font-bold">✓</span>
                                <span>INDEP.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
