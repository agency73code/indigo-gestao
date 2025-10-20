import { ChevronUp, ChevronDown, Eye, Users } from 'lucide-react';
import { Button } from '@/ui/button';
import type { Patient, SortState } from '../types/consultas.types';

interface PatientTableProps {
    patients: Patient[];
    loading?: boolean;
    onViewProfile: (patient: Patient) => void;
    sortState: SortState;
    onSort: (field: string) => void;
}

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum cliente encontrado</h3>
        <p className="text-sm text-muted-foreground">
            Tente ajustar os filtros de busca ou verifique se há dados cadastrados.
        </p>
    </div>
);

const LoadingSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
            <div
                key={index}
                className="border rounded-lg p-4 animate-pulse flex flex-col gap-3 md:grid md:grid-cols-[auto,1fr,1fr,auto] md:items-center"
            >
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-24" />
                </div>
                <div className="h-4 bg-muted rounded w-28 md:block hidden" />
                <div className="h-8 bg-muted rounded w-20 self-end md:self-center" />
            </div>
        ))}
    </div>
);

export default function PatientTable({
    patients,
    loading = false,
    onViewProfile,
    sortState,
    onSort,
}: PatientTableProps) {
    const getSortIcon = (field: string) => {
        if (sortState.field !== field) return null;
        return sortState.direction === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
        ) : (
            <ChevronDown className="w-4 h-4" />
        );
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
        const statusClasses =
            status === 'ATIVO'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';

        return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (patients.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="border rounded-[5px]">
            <div className="md:hidden divide-y">
                {patients.map((patient) => (
                    <div key={patient.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                {patient.avatarUrl ? (
                                    <img
                                        src={patient.avatarUrl.startsWith('/api') 
                                            ? `${import.meta.env.VITE_API_BASE ?? ''}${patient.avatarUrl}`
                                            : patient.avatarUrl}
                                        alt={patient.nome}
                                        className="h-10 w-10 md:h-8 md:w-8 rounded-full object-cover"
                                        referrerPolicy="no-referrer"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">
                                        {getInitials(patient.nome)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-sm text-foreground">
                                        {patient.nome}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-semibold text-foreground block text-xs mb-1">
                                    Status
                                </span>
                                {getStatusBadge(patient.status)}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 text-xs text-muted-foreground">
                            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
                                <div>
                                    <span className="font-semibold text-foreground block text-xs">
                                        E-mail
                                    </span>
                                    <span className="block text-sm text-foreground">
                                        {patient.email || 'Não informado'}
                                    </span>
                                </div>
                                <div className="sm:text-right">
                                    <span className="font-semibold text-foreground block text-xs">
                                        Responsável
                                    </span>
                                    <span className="block text-sm text-foreground">
                                        {patient.responsavel || 'Não informado'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_auto] sm:items-center">
                                <div>
                                    <span className="font-semibold text-foreground block text-xs">
                                        Telefone
                                    </span>
                                    <span className="block text-sm text-foreground">
                                        {patient.telefone || 'Não informado'}
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewProfile(patient)}
                                        className="gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Visualizar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th
                                className="text-left p-4 cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => onSort('nome')}
                            >
                                <div className="flex items-center gap-2 font-medium">
                                    Nome
                                    {getSortIcon('nome')}
                                </div>
                            </th>
                            <th className="text-left p-4 font-medium hidden md:table-cell">
                                E-mail
                            </th>
                            <th className="text-left p-4 font-medium hidden lg:table-cell">
                                Telefone
                            </th>
                            <th className="text-left p-4 font-medium">Responsável</th>
                            <th
                                className="text-left p-4 cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => onSort('status')}
                            >
                                <div className="flex items-center gap-2 font-medium">
                                    Status
                                    {getSortIcon('status')}
                                </div>
                            </th>
                            <th className="text-center p-4 font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((patient) => (
                            <tr
                                key={patient.id}
                                className="border-t hover:bg-muted/50 transition-colors"
                            >
                                <td className="p-4 align-top">
                                    <div className="flex items-center gap-3">
                                        {patient.avatarUrl ? (
                                            <img
                                                src={patient.avatarUrl.startsWith('/api') 
                                                    ? `${import.meta.env.VITE_API_BASE ?? ''}${patient.avatarUrl}`
                                                    : patient.avatarUrl}
                                                alt={patient.nome}
                                                className="h-10 w-10 md:h-8 md:w-8 rounded-full object-cover"
                                                referrerPolicy="no-referrer"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                                                {getInitials(patient.nome)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-sm text-foreground break-words">
                                                {patient.nome}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 hidden md:table-cell align-top">
                                    <span className="text-sm text-foreground break-words">
                                        {patient.email || 'Não informado'}
                                    </span>
                                </td>
                                <td className="p-4 hidden lg:table-cell align-top">
                                    <span className="text-sm text-foreground break-words">
                                        {patient.telefone || 'Não informado'}
                                    </span>
                                </td>
                                <td className="p-4 align-top">
                                    <span className="text-sm text-foreground break-words">
                                        {patient.responsavel || 'Não informado'}
                                    </span>
                                </td>
                                <td className="p-4 align-top">{getStatusBadge(patient.status)}</td>
                                <td className="p-4 text-right align-top">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewProfile(patient)}
                                        className="flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span className="hidden sm:inline">Visualizar</span>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
