import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import type { HeatmapData } from '../types';

interface StimuliHeatmapProps {
    data: HeatmapData;
    loading?: boolean;
}

const getResultColor = (resultado: 'acerto' | 'ajuda' | 'erro' | null) => {
    switch (resultado) {
        case 'acerto':
            return 'bg-primary'; // Verde
        case 'ajuda':
            return 'bg-yellow-500'; // Amarelo
        case 'erro':
            return 'bg-destructive'; // Vermelho
        default:
            return 'bg-muted'; // Cinza para sem dados
    }
};

const getResultIcon = (resultado: 'acerto' | 'ajuda' | 'erro' | null) => {
    switch (resultado) {
        case 'acerto':
            return '✓';
        case 'ajuda':
            return '✋';
        case 'erro':
            return '✗';
        default:
            return '○';
    }
};

export function StimuliHeatmap({ data, loading = false }: StimuliHeatmapProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Mapa de Calor - Estímulos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle style={{ fontFamily: 'Sora, sans-serif' }}>
                    Mapa de Calor - Estímulos × Sessões
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Visualização do desempenho por estímulo ao longo das sessões
                </p>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="min-w-[500px]">
                        {/* Header das sessões */}
                        <div
                            className="grid gap-1 mb-2"
                            style={{
                                gridTemplateColumns: `200px repeat(${data.sessoes.length}, 1fr)`,
                            }}
                        >
                            <div className="font-medium text-sm text-muted-foreground p-2">
                                Estímulos
                            </div>
                            {data.sessoes.map((sessao, index) => (
                                <div
                                    key={index}
                                    className="font-medium text-sm text-center p-2 text-muted-foreground"
                                >
                                    {sessao}
                                </div>
                            ))}
                        </div>

                        {/* Linhas dos estímulos */}
                        {data.linhas.map((linha, linhaIndex) => (
                            <div
                                key={linhaIndex}
                                className="grid gap-1 mb-1"
                                style={{
                                    gridTemplateColumns: `200px repeat(${data.sessoes.length}, 1fr)`,
                                }}
                            >
                                <div
                                    className="text-sm p-2 font-medium truncate"
                                    title={linha.estimulo}
                                >
                                    {linha.estimulo}
                                </div>
                                {linha.valores.map((valor, valorIndex) => (
                                    <div
                                        key={valorIndex}
                                        className={`
                      w-full h-8 rounded flex items-center justify-center text-xs font-medium
                      ${getResultColor(valor)}
                      ${valor ? 'text-white' : 'text-muted-foreground'}
                      hover:scale-110 transition-transform cursor-pointer
                    `}
                                        title={
                                            valor
                                                ? `${linha.estimulo} - ${data.sessoes[valorIndex]}: ${valor}`
                                                : 'Sem dados'
                                        }
                                    >
                                        <span className="text-xs">{getResultIcon(valor)}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legenda */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white text-xs">
                            ✓
                        </div>
                        <span>Acerto</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-yellow-500 flex items-center justify-center text-white text-xs">
                            ✋
                        </div>
                        <span>Ajuda</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6  rounded bg-destructive flex items-center justify-center text-white text-xs">
                            ✗
                        </div>
                        <span>Erro</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            ○
                        </div>
                        <span>Sem dados</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
