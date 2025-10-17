import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, FileText, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { TherapistPayrollSummaryDTO } from '../../types/hourEntry.types';

type OverviewByTherapistTableProps = {
    data: TherapistPayrollSummaryDTO[];
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onViewDetail: (therapistId: string) => void;
    isLoading: boolean;
};

export function OverviewByTherapistTable({
    data,
    total,
    page,
    pageSize,
    onPageChange,
    onViewDetail,
    isLoading,
}: OverviewByTherapistTableProps) {
    const totalPages = Math.ceil(total / pageSize);

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
                Nenhum dado encontrado no período selecionado.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Terapeuta</TableHead>
                            <TableHead className="text-right">Valor/h</TableHead>
                            <TableHead className="text-right">Sessões</TableHead>
                            <TableHead className="text-right">Dias</TableHead>
                            <TableHead className="text-right">Horas (brutas → pagáveis)</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Último Lançamento</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.therapistId}>
                                <TableCell className="font-medium">{item.therapistName}</TableCell>
                                <TableCell className="text-right">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    }).format(item.valorHora)}
                                </TableCell>
                                <TableCell className="text-right">{item.sessionsCount}</TableCell>
                                <TableCell className="text-right">{item.daysWorked}</TableCell>
                                <TableCell className="text-right">
                                    {item.hoursRaw.toFixed(1)}h → {item.hoursPayable}h
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                    }).format(item.totalAmount)}
                                </TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">
                                    {format(new Date(item.lastEntryAt), 'dd/MM/yy', {
                                        locale: ptBR,
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewDetail(item.therapistId)}
                                            title="Ver detalhe"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                /* TODO: Export CSV */
                                            }}
                                            title="Exportar extrato"
                                        >
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                /* TODO: Print */
                                            }}
                                            title="Imprimir resumo"
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
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
                    Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de{' '}
                    {total} terapeuta(s)
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
    );
}
