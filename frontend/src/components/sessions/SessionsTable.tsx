'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table';
import {
    CalendarIcon,
    CheckIcon,
    ChevronDownIcon,
    ColumnsIcon,
    MoreVerticalIcon,
    SearchIcon,
} from 'lucide-react';

import { StatusBadge, getStatusLabel } from '@/components/sessions/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SessionRow, SessionStatus, SessionType } from '@/lib/types/sessions';

const COLUMN_PERSIST_KEY = 'sessions-table-column-visibility';
const CENTER_ALIGN_COLUMNS = new Set(['ocpActive', 'stimuliAccuracy']);

type PeriodFilter = 'today' | 'week' | '30days' | 'custom' | 'all';

interface SessionsTableProps {
    rows: SessionRow[];
}

interface CustomRange {
    from?: string;
    to?: string;
}

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
    'Consulta Familiar': 'Consulta Familiar',
    'Consulta Individual': 'Consulta Individual',
    'Avaliação Inicial': 'Avaliação Inicial',
    'Terapia em Grupo': 'Terapia em Grupo',
};

const STATUS_LABELS: Record<SessionStatus, string> = {
    cancelled: 'Cancelado',
    completed: 'Concluído',
    in_progress: 'Em andamento',
    pending: 'Pendente',
    scheduled: 'Agendado',
};

const PERIOD_LABELS: Record<PeriodFilter, string> = {
    all: 'Todos',
    today: 'Hoje',
    week: 'Esta semana',
    '30days': 'Próximos 30 dias',
    custom: 'Intervalo custom',
};

function getInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

function formatDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    const day = date.toLocaleDateString('pt-BR', { day: '2-digit' });
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    const time = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const normalize = (text: string) =>
        text.replace('.', '').replace(/\b(\w)/, (match) => match.toUpperCase());
    return `${normalize(weekday)}, ${day} ${normalize(month)} • ${time}`;
}

function filterByPeriod(sessionRows: SessionRow[], period: PeriodFilter, customRange: CustomRange) {
    if (period === 'all') {
        return sessionRows;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (period === 'custom') {
        if (!customRange.from && !customRange.to) {
            return sessionRows;
        }
        const from = customRange.from ? new Date(customRange.from) : null;
        const to = customRange.to ? new Date(customRange.to) : null;
        return sessionRows.filter((row) => {
            const date = new Date(row.dateTime);
            if (Number.isNaN(date.getTime())) {
                return false;
            }
            if (from && date < from) {
                return false;
            }
            if (to) {
                const toEnd = new Date(to);
                toEnd.setHours(23, 59, 59, 999);
                if (date > toEnd) {
                    return false;
                }
            }
            return true;
        });
    }

    const start = new Date(startOfToday);
    const end = new Date(endOfToday);

    if (period === 'week') {
        end.setDate(end.getDate() + 7);
    }
    if (period === '30days') {
        end.setDate(end.getDate() + 30);
    }

    return sessionRows.filter((row) => {
        const date = new Date(row.dateTime);
        if (Number.isNaN(date.getTime())) {
            return false;
        }
        if (period === 'today') {
            return date >= startOfToday && date <= endOfToday;
        }
        return date >= start && date <= end;
    });
}

export function SessionsTable({ rows }: SessionsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'dateTime', desc: false }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [globalFilter, setGlobalFilter] = useState('');
    const [period, setPeriod] = useState<PeriodFilter>('week');
    const [customRange, setCustomRange] = useState<CustomRange>({});
    const [isCustomSheetOpen, setIsCustomSheetOpen] = useState(false);

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
        if (typeof window === 'undefined') {
            return { ocpActive: true, stimuliAccuracy: true };
        }
        try {
            const saved = window.localStorage.getItem(COLUMN_PERSIST_KEY);
            if (saved) {
                return JSON.parse(saved) as VisibilityState;
            }
        } catch (error) {
            console.error('Erro ao carregar preferências de colunas', error);
        }
        return { ocpActive: true, stimuliAccuracy: true };
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(COLUMN_PERSIST_KEY, JSON.stringify(columnVisibility));
        } catch (error) {
            console.error('Erro ao salvar preferências de colunas', error);
        }
    }, [columnVisibility]);

    const data = useMemo(
        () => filterByPeriod(rows, period, customRange),
        [rows, period, customRange],
    );

    const uniqueStatuses = useMemo(
        () => Array.from(new Set(rows.map((row) => row.status))),
        [rows],
    );
    const uniqueTypes = useMemo(
        () => Array.from(new Set(rows.map((row) => row.sessionType))),
        [rows],
    );
    const uniqueTherapists = useMemo(
        () => Array.from(new Set(rows.map((row) => row.therapistName))),
        [rows],
    );

    const columns = useMemo<ColumnDef<SessionRow>[]>(
        () => [
            {
                id: 'select',
                enableSorting: false,
                enableHiding: false,
                header: ({ table }) => (
                    <Checkbox
                        aria-label="Selecionar todas as sessões"
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        aria-label={`Selecionar sessão de ${row.original.patientName}`}
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                    />
                ),
            },
            {
                accessorKey: 'patientName',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2 gap-1"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Cliente
                        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const name = row.getValue<string>('patientName');
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(name)}
                                </AvatarFallback>
                            </Avatar>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a
                                            href="#"
                                            className="font-medium text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                                            aria-label={`Abrir ficha do cliente ${name}`}
                                        >
                                            {name}
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">
                                        Abrir ficha do cliente
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                },
                filterFn: (row, columnId, value) => {
                    if (!value) return true;
                    return String(row.getValue(columnId))
                        .toLowerCase()
                        .includes(String(value).toLowerCase());
                },
            },
            {
                accessorKey: 'therapistName',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2 gap-1"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Terapeuta
                        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const name = row.getValue<string>('therapistName');
                    const specialty = row.original.therapistSpecialty;
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback className="bg-muted text-muted-foreground">
                                    {getInitials(name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-medium text-foreground">{name}</span>
                                {specialty && (
                                    <span className="text-xs text-muted-foreground">
                                        {specialty}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                },
                filterFn: (row, columnId, filterValue: string[]) => {
                    if (!filterValue || filterValue.length === 0) {
                        return true;
                    }
                    return filterValue.includes(String(row.getValue(columnId)));
                },
            },
            {
                accessorKey: 'sessionType',
                header: () => 'Tipo de Sessão',
                cell: ({ row }) => {
                    const type = row.getValue<SessionType>('sessionType');
                    return (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge
                                        variant="outline"
                                        className="rounded-[999px] border-primary/50 text-primary"
                                    >
                                        {SESSION_TYPE_LABELS[type]}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                    Formato do atendimento
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                },
                filterFn: (row, columnId, filterValue: string[]) => {
                    if (!filterValue || filterValue.length === 0) return true;
                    return filterValue.includes(String(row.getValue(columnId)));
                },
            },
            {
                accessorKey: 'status',
                header: () => 'Status',
                cell: ({ row }) => {
                    const status = row.getValue<SessionStatus>('status');
                    return (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        aria-label={`Status da sessão: ${getStatusLabel(status)}`}
                                    >
                                        <StatusBadge
                                            status={status}
                                            className="uppercase tracking-tight"
                                        />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                    Situação atual da sessão
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                },
                filterFn: (row, columnId, filterValue: string) => {
                    if (!filterValue) return true;
                    return String(row.getValue(columnId)) === filterValue;
                },
            },
            {
                accessorKey: 'dateTime',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2 gap-1"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Data & Hora
                        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const formatted = formatDateTime(row.getValue<string>('dateTime'));
                    const modality = row.original.modality;
                    return (
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground">{formatted}</span>
                            {modality && (
                                <span className="text-xs capitalize text-muted-foreground">
                                    {modality}
                                </span>
                            )}
                        </div>
                    );
                },
                sortingFn: (a, b, columnId) => {
                    const aDate = new Date(a.getValue<string>(columnId)).getTime();
                    const bDate = new Date(b.getValue<string>(columnId)).getTime();
                    return aDate - bDate;
                },
            },
            {
                accessorKey: 'ocpActive',
                header: () => 'OCP Ativos',
                cell: ({ row }) => (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className="font-medium"
                                    aria-label="Programas & objetivos ativos"
                                >
                                    {row.getValue<number>('ocpActive')}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                                Total de programas / objetivos em execução para este cliente
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ),
                meta: {
                    align: 'center',
                },
            },
            {
                accessorKey: 'stimuliAccuracy',
                header: () => 'Acurácia (4 sem)',
                cell: ({ row }) => (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className="font-medium text-primary"
                                    aria-label="Acurácia de estímulos"
                                >
                                    {row.getValue<number>('stimuliAccuracy')}%
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                                Média de acerto de estímulos nas últimas 4 semanas
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ),
                meta: {
                    align: 'center',
                },
            },
            {
                id: 'actions',
                enableHiding: false,
                header: () => 'Ações',
                cell: ({ row }) => {
                    const session = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-primary"
                                    aria-label={`Ações para ${session.patientName}`}
                                >
                                    <MoreVerticalIcon className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Ações rápidas</DropdownMenuLabel>
                                <DropdownMenuItem>Ver ficha</DropdownMenuItem>
                                <DropdownMenuItem>Registrar sessão</DropdownMenuItem>
                                <DropdownMenuItem>Atualizar programa / objetivo</DropdownMenuItem>
                                <DropdownMenuItem>Reagendar</DropdownMenuItem>
                                <DropdownMenuItem>Cancelar</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Arquivar</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        // columns are static (only their renderers reference row data at render time)
        // so we don't need to re-create the column definitions when `rows` changes.
        // Keeping this array empty avoids an unnecessary lint warning from
        // react-hooks/exhaustive-deps while ensuring stable column refs.
        [],
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        enableRowSelection: true,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: (row, _columnId, filterValue) => {
            if (!filterValue) return true;
            const search = String(filterValue).toLowerCase();
            const columnsToSearch: Array<keyof SessionRow> = [
                'patientName',
                'therapistName',
                'sessionType',
                'status',
            ];
            return columnsToSearch.some((key) =>
                String(row.getValue(key as string))
                    .toLowerCase()
                    .includes(search),
            );
        },
    });

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const hasSelection = selectedRows.length > 0;

    const handlePeriodChange = (value: PeriodFilter) => {
        if (value === 'custom') {
            setIsCustomSheetOpen(true);
            return;
        }
        setPeriod(value);
    };

    const applyCustomRange = () => {
        setPeriod('custom');
        setIsCustomSheetOpen(false);
    };

    const resetCustomRange = () => {
        setCustomRange({});
        setPeriod('all');
        setIsCustomSheetOpen(false);
    };

    const totalRows = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const to = totalRows === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, totalRows);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative w-full lg:w-72">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={globalFilter ?? ''}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            placeholder="Buscar por cliente, terapeuta ou tipo…"
                            className="pl-9"
                            aria-label="Buscar por cliente, terapeuta ou tipo"
                        />
                    </div>
                    <Separator orientation="vertical" className="hidden h-9 lg:block" />
                    <div className="flex flex-wrap gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    Status
                                    <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuItem
                                    onClick={() => table.getColumn('status')?.setFilterValue('')}
                                >
                                    Todos
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {uniqueStatuses.map((status) => (
                                    <DropdownMenuItem
                                        key={status}
                                        onClick={() =>
                                            table.getColumn('status')?.setFilterValue(status)
                                        }
                                    >
                                        {STATUS_LABELS[status]}
                                        {table.getColumn('status')?.getFilterValue() === status && (
                                            <CheckIcon className="ml-auto h-4 w-4" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    Tipo
                                    <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {uniqueTypes.map((type) => {
                                    const filterValues =
                                        (table
                                            .getColumn('sessionType')
                                            ?.getFilterValue() as string[]) ?? [];
                                    const isChecked = filterValues.includes(type);
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={type}
                                            checked={isChecked}
                                            onCheckedChange={(value) => {
                                                const next = value
                                                    ? [...filterValues, type]
                                                    : filterValues.filter((item) => item !== type);
                                                table
                                                    .getColumn('sessionType')
                                                    ?.setFilterValue(next);
                                            }}
                                        >
                                            {type}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    Terapeuta
                                    <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>Filtrar por terapeuta</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {uniqueTherapists.map((therapist) => {
                                    const filterValues =
                                        (table
                                            .getColumn('therapistName')
                                            ?.getFilterValue() as string[]) ?? [];
                                    const isChecked = filterValues.includes(therapist);
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={therapist}
                                            checked={isChecked}
                                            onCheckedChange={(value) => {
                                                const next = value
                                                    ? [...filterValues, therapist]
                                                    : filterValues.filter(
                                                          (item) => item !== therapist,
                                                      );
                                                table
                                                    .getColumn('therapistName')
                                                    ?.setFilterValue(next);
                                            }}
                                        >
                                            {therapist}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Select
                            value={period}
                            onValueChange={(value) => handlePeriodChange(value as PeriodFilter)}
                        >
                            <SelectTrigger
                                className="w-[170px] justify-between gap-2"
                                aria-label="Filtrar por período"
                            >
                                <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                                <SelectValue placeholder="Período" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {PERIOD_LABELS[option]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <ColumnsIcon className="h-4 w-4" aria-hidden="true" />
                                Personalizar colunas
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table.getAllLeafColumns().map((column) => {
                                if (!column.getCanHide()) {
                                    return null;
                                }
                                const columnId = column.id;
                                const labelMap: Record<string, string> = {
                                    ocpActive: 'OCP Ativos',
                                    stimuliAccuracy: 'Acurácia (4 sem)',
                                };
                                const label =
                                    labelMap[columnId] ??
                                    column.columnDef.header?.toString() ??
                                    columnId;
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {label}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {hasSelection && (
                <div className="flex flex-wrap items-center gap-2 rounded-[6px] border border-primary/20 bg-primary/5 p-3 text-sm">
                    <span className="font-medium text-primary">
                        {selectedRows.length} sessão(ões) selecionada(s)
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm">
                            Confirmar presença
                        </Button>
                        <Button variant="secondary" size="sm">
                            Marcar como concluída
                        </Button>
                        <Button variant="secondary" size="sm">
                            Reagendar
                        </Button>
                        <Button variant="destructive" size="sm">
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            <div className="rounded-[6px] border">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            'align-middle',
                                            CENTER_ALIGN_COLUMNS.has(header.column.id) &&
                                                'text-center',
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            <>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className={cn(
                                                    CENTER_ALIGN_COLUMNS.has(cell.column.id) &&
                                                        'text-center',
                                                )}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </>
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getVisibleLeafColumns().length}
                                    className="h-48 text-center"
                                >
                                    <div className="flex h-full flex-col items-center justify-center gap-3">
                                        <h3 className="text-base font-semibold text-foreground">
                                            Sem sessões para os filtros atuais
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Ajuste os filtros ou crie uma nova sessão.
                                        </p>
                                        <Button
                                            className="bg-primary text-primary-foreground"
                                            size="sm"
                                        >
                                            Nova sessão
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    Mostrando {from}-{to} de {totalRows}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Próximo
                    </Button>
                </div>
            </div>

            <Sheet open={isCustomSheetOpen} onOpenChange={setIsCustomSheetOpen}>
                <SheetContent className="w-full max-w-md">
                    <SheetHeader>
                        <SheetTitle>Selecionar intervalo custom</SheetTitle>
                        <SheetDescription>
                            Defina um período específico para visualizar as sessões.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="custom-from" className="text-sm font-medium">
                                Início
                            </label>
                            <Input
                                id="custom-from"
                                type="date"
                                value={customRange.from ?? ''}
                                onChange={(event) =>
                                    setCustomRange((prev) => ({
                                        ...prev,
                                        from: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="custom-to" className="text-sm font-medium">
                                Fim
                            </label>
                            <Input
                                id="custom-to"
                                type="date"
                                value={customRange.to ?? ''}
                                onChange={(event) =>
                                    setCustomRange((prev) => ({ ...prev, to: event.target.value }))
                                }
                            />
                        </div>
                    </div>
                    <SheetFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <SheetClose asChild>
                            <Button variant="outline" onClick={resetCustomRange}>
                                Limpar
                            </Button>
                        </SheetClose>
                        <SheetClose asChild>
                            <Button
                                onClick={applyCustomRange}
                                className="bg-primary text-primary-foreground"
                            >
                                Aplicar
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
