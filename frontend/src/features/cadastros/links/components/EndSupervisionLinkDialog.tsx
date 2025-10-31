import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { EndSupervisionLinkDialogProps } from '../types';

export default function EndSupervisionLinkDialog({
    open,
    onClose,
    onConfirm,
    link,
    loading = false,
}: EndSupervisionLinkDialogProps) {
    const [endDate, setEndDate] = useState<Date>();
    const [showCalendar, setShowCalendar] = useState(false);
    const [error, setError] = useState<string>('');

    // Resetar quando abrir/fechar
    useEffect(() => {
        if (open) {
            setEndDate(new Date());
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
            if (endDate < startDateObj) {
                setError('A data de encerramento não pode ser anterior à data de início');
                return;
            }
        }

        const formattedDate = format(endDate, 'yyyy-MM-dd');
        onConfirm(formattedDate);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[95vw] sm:w-full mx-auto rounded-[5px]">
                <DialogHeader>
                    <DialogTitle
                        style={{ fontFamily: 'Sora, sans-serif' }}
                        className="text-lg sm:text-xl font-semibold"
                    >
                        Encerrar Vínculo de Supervisão
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Defina a data de encerramento do vínculo de supervisão. O vínculo será marcado
                        como encerrado.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {link && link.startDate && (
                        <div className="rounded-lg border bg-muted/50 p-3">
                            <div className="flex gap-2">
                                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-sm text-muted-foreground">
                                    Data de início:{' '}
                                    <span className="font-medium text-foreground">
                                        {link.startDate.split('-').reverse().join('/')}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Data de Encerramento *</Label>
                        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !endDate && 'text-muted-foreground',
                                        error && 'border-destructive'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? (
                                        format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                    ) : (
                                        <span>Selecione a data</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => {
                                        setEndDate(date);
                                        setShowCalendar(false);
                                        setError('');
                                    }}
                                    locale={ptBR}
                                    disabled={(date) => {
                                        // Desabilitar datas futuras
                                        if (date > new Date()) return true;
                                        // Desabilitar datas anteriores à data de início
                                        if (link && link.startDate) {
                                            return date < new Date(link.startDate);
                                        }
                                        return false;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 sm:flex-none"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 sm:flex-none gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Encerrar Vínculo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
