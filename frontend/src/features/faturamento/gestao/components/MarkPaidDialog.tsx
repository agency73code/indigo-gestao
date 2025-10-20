import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';
import { RECEIPT_TYPE_LABELS } from '../../types/hourEntry.types';
import type { ReceiptType, MarkPaidPayload } from '../../types/hourEntry.types';
import { cn } from '@/lib/utils';

type MarkPaidDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (payload: Omit<MarkPaidPayload, 'entryIds'>) => void;
};

export function MarkPaidDialog({ open, onOpenChange, onConfirm }: MarkPaidDialogProps) {
    const [paidAt, setPaidAt] = useState<Date>(new Date());
    const [receiptType, setReceiptType] = useState<ReceiptType>('NOTA_FISCAL');
    const [receiptNumber, setReceiptNumber] = useState('');

    const handleConfirm = () => {
        onConfirm({
            paidAt: format(paidAt, 'yyyy-MM-dd'),
            receiptType,
            receiptNumber: receiptNumber || undefined,
        });
        // Reset
        setPaidAt(new Date());
        setReceiptType('NOTA_FISCAL');
        setReceiptNumber('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Marcar como Pago</DialogTitle>
                    <DialogDescription>
                        Informe o tipo e a data do comprovante de pagamento.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Data de Pagamento */}
                    <div className="grid gap-2">
                        <Label htmlFor="paid-date">Data de Pagamento *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="paid-date"
                                    variant="outline"
                                    className={cn(
                                        'justify-start text-left font-normal',
                                        !paidAt && 'text-muted-foreground',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {paidAt ? (
                                        format(paidAt, 'dd/MM/yyyy', { locale: ptBR })
                                    ) : (
                                        <span>Selecione uma data</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={paidAt}
                                    onSelect={(date) => date && setPaidAt(date)}
                                    locale={ptBR}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Tipo de Comprovante */}
                    <div className="grid gap-2">
                        <Label htmlFor="receipt-type">Tipo de Comprovante *</Label>
                        <select
                            id="receipt-type"
                            value={receiptType}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setReceiptType(e.target.value as ReceiptType)
                            }
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="NOTA_FISCAL">{RECEIPT_TYPE_LABELS.NOTA_FISCAL}</option>
                            <option value="RECIBO_PF">{RECEIPT_TYPE_LABELS.RECIBO_PF}</option>
                            <option value="RECIBO_PJ">{RECEIPT_TYPE_LABELS.RECIBO_PJ}</option>
                        </select>
                    </div>

                    {/* Número do Comprovante (opcional) */}
                    <div className="grid gap-2">
                        <Label htmlFor="receipt-number">Número do Comprovante (opcional)</Label>
                        <input
                            id="receipt-number"
                            type="text"
                            value={receiptNumber}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setReceiptNumber(e.target.value)
                            }
                            placeholder="Ex: NF-2025-10001"
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm}>Confirmar Pagamento</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
