import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { DateField } from '@/common/components/layout/DateField';
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

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-[5px]">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg font-semibold font-sora flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                        Encerrar Vínculo
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                        Defina a data de encerramento do vínculo. Esta ação marcará o vínculo como
                        encerrado, mas manterá o histórico para consultas futuras.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
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
                    <div className="bg-muted/50 rounded-md p-4">
                        <h4 className="text-sm font-medium mb-2">Informações do Vínculo</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Data de início:</span>
                                <span className="font-medium">
                                    {link.startDate &&
                                        format(new Date(link.startDate), 'dd/MM/yyyy')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Área de atuação:</span>
                                <span className="font-medium">
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
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
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

                <DialogFooter className="gap-2 sm:gap-3 flex-col sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        variant="destructive"
                        className="w-full sm:w-auto gap-2 order-1 sm:order-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <span className="sm:hidden">Encerrar</span>
                        <span className="hidden sm:inline">Encerrar Vínculo</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
