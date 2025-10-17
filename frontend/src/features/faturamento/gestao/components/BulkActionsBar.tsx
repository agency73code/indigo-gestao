import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type BulkActionsBarProps = {
    selectedCount: number;
    onApprove: () => void;
    onReject: (reason?: string) => void;
    onMarkPaid?: () => void;
    showMarkPaid?: boolean;
};

export function BulkActionsBar({
    selectedCount,
    onApprove,
    onReject,
    onMarkPaid,
    showMarkPaid = false,
}: BulkActionsBarProps) {
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleReject = () => {
        onReject(rejectionReason);
        setShowRejectDialog(false);
        setRejectionReason('');
    };

    if (selectedCount === 0) {
        return (
            <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                Selecione lançamentos para realizar ações em massa.
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">
                        {selectedCount} lançamento(s) selecionado(s)
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onApprove}
                        className="gap-2 text-green-600 hover:text-green-700"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Aprovar Selecionados
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRejectDialog(true)}
                        className="gap-2 text-red-600 hover:text-red-700"
                    >
                        <XCircle className="h-4 w-4" />
                        Reprovar Selecionados
                    </Button>
                    {showMarkPaid && onMarkPaid && (
                        <Button variant="default" size="sm" onClick={onMarkPaid} className="gap-2">
                            Marcar como Pago
                        </Button>
                    )}
                </div>
            </div>

            {/* Dialog: Reprovar */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reprovar Lançamentos</AlertDialogTitle>
                        <AlertDialogDescription>
                            Descreva o motivo da reprovação (opcional).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <textarea
                        value={rejectionReason}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setRejectionReason(e.target.value)
                        }
                        placeholder="Ex: Horário inconsistente com o agendamento..."
                        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRejectionReason('')}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleReject}>Reprovar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
