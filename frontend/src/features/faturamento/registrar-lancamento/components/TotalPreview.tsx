import { DollarSign, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TotalPreviewProps {
    durationMinutes: number;
    hourlyRate: number;
    travelCost: number;
    total: number;
}

export default function TotalPreview({
    durationMinutes,
    hourlyRate,
    travelCost,
    total,
}: TotalPreviewProps) {
    // Formatação de valor monetário
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const durationHours = durationMinutes / 60;

    return (
        <Card className="rounded-[5px] mb-10 px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total estimado
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4" aria-live="polite">
                {/* Total principal */}
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                        {formatCurrency(total)}
                    </div>
                    <p className="text-sm text-muted-foreground">Valor total do atendimento</p>
                </div>

                {/* Detalhamento */}
                {(durationMinutes > 0 || hourlyRate > 0 || travelCost > 0) && (
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium text-sm">Detalhamento:</h4>

                        {/* Horas lançadas */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>Horas lançadas</span>
                            </div>
                            <span className="font-medium">{durationHours.toFixed(1)}h</span>
                        </div>

                        {/* Valor por hora */}
                        {hourlyRate > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>R$/h</span>
                                </div>
                                <span className="font-medium">{formatCurrency(hourlyRate)}</span>
                            </div>
                        )}

                        {/* Base calculation */}
                        {durationMinutes > 0 && hourlyRate > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span>Subtotal (horas × valor)</span>
                                <span className="font-medium">
                                    {formatCurrency(durationHours * hourlyRate)}
                                </span>
                            </div>
                        )}

                        {/* Deslocamento */}
                        {travelCost > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>Deslocamento</span>
                                </div>
                                <span className="font-medium">{formatCurrency(travelCost)}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
