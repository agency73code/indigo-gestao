import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { HourEntryDTO } from '../../types/hourEntry.types';
import { STATUS_LABELS, STATUS_COLORS, DURATION_OPTIONS } from '../../types/hourEntry.types';

interface HourEntryTableProps {
    entries: HourEntryDTO[];
    isLoading?: boolean;
}

export function HourEntryTable({ entries, isLoading }: HourEntryTableProps) {
    // Formatar duração
    const formatDuration = (minutes: number) => {
        const option = DURATION_OPTIONS.find((o) => o.value === minutes);
        return option ? option.label : `${minutes} min`;
    };

    // Gerar iniciais do nome
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum lançamento encontrado</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Você ainda não tem lançamentos neste período.
                </p>
                <Button
                    onClick={() => (window.location.href = '/app/faturamento/registrar-lancamento')}
                >
                    Registrar Lançamento
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-[5px] border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-4">Data</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px] text-center px-4">Observação</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-medium px-4">
                                {format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {/* Avatar do paciente */}
                                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600 flex-shrink-0">
                                        {getInitials(entry.patientName || 'N/A')}
                                    </div>
                                    {/* Nome do paciente */}
                                    <span>{entry.patientName || 'N/A'}</span>
                                </div>
                            </TableCell>
                            <TableCell>{entry.startTime || '-'}</TableCell>
                            <TableCell>{formatDuration(entry.durationMinutes)}</TableCell>
                            <TableCell>
                                <Badge className={STATUS_COLORS[entry.status]}>
                                    {STATUS_LABELS[entry.status]}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                {entry.notes ? (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                aria-label="Ver observação"
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80" align="center">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <h4 className="font-semibold text-sm">
                                                        Observação
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {entry.notes}
                                                </p>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    <span className="text-muted-foreground text-xs">-</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
