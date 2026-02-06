import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { DateField } from '@/common/components/layout/DateField';
import { SlidePanel } from '@/components/layout/SlidePanel';
import type { EndLinkDialogProps } from '../types';

export default function EndLinkDialog({
    open,
    onClose,
    onConfirm,
    link,
    loading = false,
}: EndLinkDialogProps) {
    // Estados do formulário
    const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

    // Estados de validação
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Efeito para limpar formulário quando abrir
    useEffect(() => {
        if (open) {
            setEndDate(format(new Date(), 'yyyy-MM-dd'));
            setErrors({});
        }
    }, [open]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!endDate) {
            newErrors.endDate = 'Selecione a data de encerramento';
        } else if (link?.startDate) {
            // Comparar apenas as datas, sem horários
            const endDateObj = new Date(endDate);
            const startDateObj = new Date(link.startDate);
            
            if (endDateObj < startDateObj) {
                newErrors.endDate =
                    'A data de encerramento não pode ser anterior à data de início do vínculo';
            }
        }
        
        // Verificar se a data de encerramento não está no futuro
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDateObj = new Date(endDate);
        
        if (endDateObj > today) {
            newErrors.endDate = 'A data de encerramento não pode ser no futuro';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        onConfirm(endDate);
    };

    if (!link) return null;

    const headerActions = (
        <Button
            onClick={handleSubmit}
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
            title="Encerrar Vínculo"
            subtitle="Defina a data de encerramento do vínculo"
            headerActions={headerActions}
            width="md"
        >
            <div className="space-y-6">
                {/* Data de Encerramento */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Data de Encerramento *</Label>
                    <DateField
                        value={endDate}
                        onChange={(iso) => {
                            setEndDate(iso);
                            if (errors.endDate) {
                                setErrors((prev) => ({ ...prev, endDate: '' }));
                            }
                        }}
                        placeholder="Selecione uma data"
                        error={errors.endDate}
                        maxDate={new Date()}
                        minDate={link?.startDate ? new Date(link.startDate) : undefined}
                        disabled={(date) => {
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            const isFuture = date > today;
                            const isBeforeStart = link?.startDate && date < new Date(link.startDate);
                            return isFuture || Boolean(isBeforeStart);
                        }}
                    />
                </div>

                {/* Informações do vínculo atual */}
                <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3">Informações do Vínculo</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Data de início:</span>
                            <span className="font-medium text-foreground">
                                {link.startDate &&
                                    format(new Date(link.startDate), 'dd/MM/yyyy')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Área de atuação:</span>
                            <span className="font-medium text-foreground">
                                {link.actuationArea || 'Atuação não definida'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Status atual:</span>
                            <span className="font-medium text-green-600">Ativo</span>
                        </div>
                    </div>
                </div>

                {/* Aviso importante */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">Atenção</h3>
                            <div className="mt-2 text-sm text-amber-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>O vínculo será marcado como "Encerrado"</li>
                                    <li>O histórico será mantido para consultas</li>
                                    <li>Esta ação pode ser revertida se necessário</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SlidePanel>
    );
}
