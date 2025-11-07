import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DateField } from '@/common/components/layout/DateField';

interface DateSectionProps {
    prazoInicio?: string | null;
    prazoFim?: string | null;
    onPrazoInicioChange: (date: string) => void;
    onPrazoFimChange: (date: string) => void;
    hasChanges?: boolean;
}

export default function DateSection({
    prazoInicio,
    prazoFim,
    onPrazoInicioChange,
    onPrazoFimChange,
    hasChanges = false,
}: DateSectionProps) {
    const formatDateToISO = (date: string) => {
        if (!date) return '';
        // O DateField retorna em formato yyyy-MM-dd, convertemos para ISO completo
        return new Date(date + 'T00:00:00.000Z').toISOString();
    };

    const formatISOToDate = (isoString: string | null | undefined) => {
        if (!isoString) return '';
        // Corta qualquer parte de horário e devolve só a data
        return isoString.split('T')[0];
    };

    return (
        <Card padding="small" className="rounded-[5px]">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Prazo do Programa
                    {hasChanges && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Alterado
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
                {/* Data de Início */}
                <div className="space-y-2">
                    <Label htmlFor="prazo-inicio" className="text-sm font-medium">
                        Data de início
                    </Label>
                    <DateField
                        value={formatISOToDate(prazoInicio)}
                        onChange={(date) => onPrazoInicioChange(formatDateToISO(date))}
                        placeholder="Selecione a data de início"
                    />
                    <p className="text-xs text-muted-foreground">
                        Data em que o programa foi iniciado
                    </p>
                </div>

                {/* Data de Fim */}
                <div className="space-y-2">
                    <Label htmlFor="prazo-fim" className="text-sm font-medium">
                        Data de fim
                    </Label>
                    <DateField
                        value={formatISOToDate(prazoFim)}
                        onChange={(date) => onPrazoFimChange(formatDateToISO(date))}
                        placeholder="Selecione a data de fim"
                        minDate={prazoInicio ? new Date(formatISOToDate(prazoInicio)) : undefined}
                    />
                    <p className="text-xs text-muted-foreground">
                        Data prevista para finalização do programa
                    </p>
                </div>

                {/* Informação sobre as datas */}
                {prazoInicio && prazoFim && (
                    <div className="pt-2 border-t text-sm text-muted-foreground">
                        <p>
                            Duração:{' '}
                            {Math.ceil(
                                (new Date(prazoFim).getTime() - new Date(prazoInicio).getTime()) /
                                    (1000 * 60 * 60 * 24),
                            )}{' '}
                            dias
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
