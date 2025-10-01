import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Checkbox } from '@/components/ui/checkbox';
import { DateField } from '@/common/components/layout/DateField';
import { maskBRL, parseBRLToNumber } from '@/common/utils/mask';

interface BillingFormProps {
    date: string;
    time: string;
    durationOption: string;
    customDurationMinutes: number;
    hourlyRate: number;
    hasTravelCost: boolean;
    travelCost: number;
    notes: string;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    onDurationOptionChange: (option: string) => void;
    onCustomDurationChange: (minutes: number) => void;
    onHourlyRateChange: (rate: number) => void;
    onHasTravelCostChange: (hasCost: boolean) => void;
    onTravelCostChange: (cost: number) => void;
    onNotesChange: (notes: string) => void;
}

const durationOptions = [
    { value: '30', label: '30min', minutes: 30 },
    { value: '60', label: '1h', minutes: 60 },
    { value: '90', label: '1h30', minutes: 90 },
    { value: '120', label: '2h', minutes: 120 },
    { value: 'custom', label: 'Personalizado', minutes: 0 },
];

export default function BillingForm({
    date,
    time,
    durationOption,
    customDurationMinutes,
    hourlyRate,
    hasTravelCost,
    travelCost,
    notes,
    onDateChange,
    onTimeChange,
    onDurationOptionChange,
    onCustomDurationChange,
    onHourlyRateChange,
    onHasTravelCostChange,
    onTravelCostChange,
    onNotesChange,
}: BillingFormProps) {
    const handleHourlyRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const maskedValue = maskBRL(e.target.value);
        const numericValue = parseBRLToNumber(maskedValue) || 0;
        onHourlyRateChange(numericValue);
    };

    const handleTravelCostInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const maskedValue = maskBRL(e.target.value);
        const numericValue = parseBRLToNumber(maskedValue) || 0;
        onTravelCostChange(numericValue);
    };

    return (
        <Card className="rounded-[5px] px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Dados do atendimento
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Informe os dados do atendimento. Campos marcados com * são obrigatórios.
                </p>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4 md:space-y-6">
                {/* Data e Horário seguindo padrão do cadastro de terapeuta */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                    {/* Data do atendimento */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Data do atendimento *</Label>
                        <DateField value={date} onChange={onDateChange} placeholder="dd/mm/aaaa" />
                    </div>

                    {/* Horário (opcional) */}
                    <div className="space-y-2">
                        <Label htmlFor="time">Horário (opcional)</Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => onTimeChange(e.target.value)}
                            className="rounded-[5px]"
                        />
                    </div>
                </div>

                {/* Duração */}
                <div className="space-y-3">
                    <Label>Duração *</Label>
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={durationOption}
                        onValueChange={(value) => value && onDurationOptionChange(value)}
                        className="flex flex-wrap gap-2"
                    >
                        {durationOptions.map((option) => (
                            <ToggleGroupItem
                                key={option.value}
                                value={option.value}
                                className="flex-1 min-w-fit text-sm rounded-[5px] h-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                {option.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>

                    {durationOption === 'custom' && (
                        <div className="mt-3">
                            <Label htmlFor="customDuration">Duração (minutos) *</Label>
                            <Input
                                id="customDuration"
                                type="number"
                                min={1}
                                step={5}
                                value={customDurationMinutes || ''}
                                onChange={(e) =>
                                    onCustomDurationChange(parseInt(e.target.value) || 0)
                                }
                                placeholder="Ex: 45"
                                className="rounded-[5px] mt-1"
                                required
                            />
                        </div>
                    )}
                </div>

                {/* Valor hora seguindo padrão do sistema */}
                <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Valor hora (R$/h) *</Label>
                    <Input
                        id="hourlyRate"
                        type="text"
                        inputMode="numeric"
                        value={hourlyRate > 0 ? maskBRL((hourlyRate * 100).toString()) : ''}
                        onChange={handleHourlyRateInputChange}
                        placeholder="R$ 0,00"
                        className="rounded-[5px]"
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Valor hora do cadastro do profissional. Você pode editar se necessário.
                    </p>
                </div>

                {/* Deslocamento */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="hasTravelCost"
                            checked={hasTravelCost}
                            onCheckedChange={onHasTravelCostChange}
                            className="rounded-[3px]"
                        />
                        <Label
                            htmlFor="hasTravelCost"
                            className="text-sm font-medium cursor-pointer"
                        >
                            Houve custo de deslocamento?
                        </Label>
                    </div>

                    {hasTravelCost && (
                        <div className="space-y-2">
                            <Label htmlFor="travelCost">Valor do deslocamento (R$) *</Label>
                            <Input
                                id="travelCost"
                                type="text"
                                inputMode="numeric"
                                value={travelCost > 0 ? maskBRL((travelCost * 100).toString()) : ''}
                                onChange={handleTravelCostInputChange}
                                placeholder="R$ 0,00"
                                className="rounded-[5px]"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Informe o valor gasto com deslocamento para o atendimento.
                            </p>
                        </div>
                    )}
                </div>

                {/* Observações */}
                <div className="space-y-2">
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            onNotesChange(e.target.value)
                        }
                        placeholder="Ex.: atendimento domiciliar, substituição, observações clínicas relevantes."
                        className="flex min-h-[80px] w-full rounded-[5px] border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={3}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
