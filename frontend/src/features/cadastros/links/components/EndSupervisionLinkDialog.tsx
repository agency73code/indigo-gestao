import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DateField } from '@/common/components/layout/DateField';
import { SlidePanel } from '@/components/layout/SlidePanel';
import type { EndSupervisionLinkDialogProps } from '../types';

export default function EndSupervisionLinkDialog({
    open,
    onClose,
    onConfirm,
    link,
    loading = false,
}: EndSupervisionLinkDialogProps) {
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [error, setError] = useState<string>('');

    // Resetar quando abrir/fechar
    useEffect(() => {
        if (open) {
            setEndDate(format(new Date(), 'yyyy-MM-dd'));
            setError('');
        }
    }, [open]);

    const handleConfirm = () => {
        if (!endDate) {
            setError('Selecione uma data de encerramento');
            return;
        }

        // Validar se a data não é anterior à data de início
        if (link && link.startDate) {
            const startDateObj = new Date(link.startDate);
            const endDateObj = new Date(endDate);
            if (endDateObj < startDateObj) {
                setError('A data de encerramento não pode ser anterior à data de início');
                return;
            }
        }

        onConfirm(endDate);
    };

    const headerActions = (
        <Button
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[120px]"
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Encerrar Vínculo
        </Button>
    );

    return (
        <SlidePanel
            isOpen={open}
            onClose={onClose}
            title="Encerrar Vínculo de Supervisão"
            subtitle="Defina a data de encerramento"
            headerActions={headerActions}
            width="md"
        >
            <div className="space-y-6">
                {/* Informação da data de início */}
                {link && link.startDate && (
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex gap-2">
                            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm text-muted-foreground">
                                Data de início:{' '}
                                <span className="font-medium text-foreground">
                                    {format(new Date(link.startDate), 'dd/MM/yyyy')}
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Data de Encerramento */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Data de Encerramento *</Label>
                    <DateField
                        value={endDate}
                        onChange={(iso) => {
                            setEndDate(iso);
                            setError('');
                        }}
                        placeholder="Selecione a data"
                        error={error}
                        maxDate={new Date()}
                        minDate={link?.startDate ? new Date(link.startDate) : undefined}
                        disabled={(date) => {
                            // Desabilitar datas futuras
                            if (date > new Date()) return true;
                            // Desabilitar datas anteriores à data de início
                            if (link && link.startDate) {
                                return date < new Date(link.startDate);
                            }
                            return false;
                        }}
                    />
                </div>

                {/* Aviso */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">Atenção</h3>
                            <div className="mt-2 text-sm text-amber-700">
                                <p>O vínculo de supervisão será marcado como encerrado na data selecionada.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SlidePanel>
    );
}
