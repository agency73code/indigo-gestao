import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { STATUS_LABELS, STATUS_COLORS } from '../../types/hourEntry.types';
import type { ManagerEntryDTO } from '../../types/hourEntry.types';

type TherapistDetailTableProps = {
    data: ManagerEntryDTO[];
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    selectedIds: string[];
    onToggleSelect: (ids: string[]) => void;
    onApprove: (ids: string[]) => void;
    onReject: (ids: string[], reason?: string) => void;
    onMarkPaid: (ids: string[]) => void;
    isLoading: boolean;
};

export function TherapistDetailTable({
    data,
    total,
    page,
    pageSize,
    onPageChange,
    selectedIds,
    onToggleSelect,
    onApprove,
    onReject,
    onMarkPaid,
    isLoading,
}: TherapistDetailTableProps) {
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectId, setRejectId] = useState<string>('');
    const [rejectionReason, setRejectionReason] = useState('');

    const totalPages = Math.ceil(total / pageSize);
    const allSelected = data.length > 0 && data.every((item) => selectedIds.includes(item.id));

    const toggleAll = () => {
        if (allSelected) {
            onToggleSelect([]);
        } else {
            onToggleSelect(data.map((item) => item.id));
        }
    };

    const toggleRow = (id: string) => {
        if (selectedIds.includes(id)) {
            onToggleSelect(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            onToggleSelect([...selectedIds, id]);
        }
    };

    const handleRejectSingle = (id: string) => {
        setRejectId(id);
        setShowRejectDialog(true);
    };

    const confirmReject = () => {
        onReject([rejectId], rejectionReason);
        setShowRejectDialog(false);
        setRejectId('');
        setRejectionReason('');
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Carregando...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Nenhum lançamento encontrado.
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                                </TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Paciente</TableHead>
                                <TableHead>Início</TableHead>
                                <TableHead className="text-right">Duração</TableHead>
                                <TableHead className="text-center">Deslocamento</TableHead>
                                <TableHead className="text-right">Horas Pagáveis</TableHead>
                                <TableHead className="text-right">Valor/h</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(entry.id)}
                                            onCheckedChange={() => toggleRow(entry.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(entry.date), 'dd/MM/yy', { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {entry.patientName}
                                    </TableCell>
                                    <TableCell>{entry.startTime || '—'}</TableCell>
                                    <TableCell className="text-right">
                                        {entry.durationMinutes} min
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {entry.hasTravel ? '✓' : '—'}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {entry.payableHours}h
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }).format(entry.valorHora)}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        }).format(entry.payableAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={STATUS_COLORS[entry.status]}>
                                            {STATUS_LABELS[entry.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {entry.status === 'submitted' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onApprove([entry.id])}
                                                        title="Aprovar"
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRejectSingle(entry.id)}
                                                        title="Reprovar"
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {entry.status === 'approved' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onMarkPaid([entry.id])}
                                                    title="Marcar como pago"
                                                    className="text-purple-600 hover:text-purple-700"
                                                >
                                                    <DollarSign className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)}{' '}
                        de {total} lançamento(s)
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(page - 1)}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-sm">
                                Página {page} de {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(page + 1)}
                                disabled={page === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog: Reprovar */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reprovar Lançamento</AlertDialogTitle>
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
                        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRejectionReason('')}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmReject}>Reprovar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
