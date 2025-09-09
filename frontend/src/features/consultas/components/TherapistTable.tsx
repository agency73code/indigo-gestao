import { ChevronUp, ChevronDown, Eye, User } from 'lucide-react';
import { Button } from '@/ui/button';
import type { Therapist, SortState } from '../types/consultas.types';

interface TherapistTableProps {
    therapists: Therapist[];
    loading?: boolean;
    onViewProfile: (therapist: Therapist) => void;
    sortState: SortState;
    onSort: (field: string) => void;
}

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum terapeuta encontrado</h3>
        <p className="text-sm text-muted-foreground">
            Tente ajustar os filtros de busca ou verifique se há dados cadastrados.
        </p>
    </div>
);

const LoadingSkeleton = () => (
    <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-[200px]" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-[150px]" />
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-[100px]" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-[120px]" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-[60px]" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-[80px]" />
            </div>
        ))}
    </div>
);

export default function TherapistTable({
    therapists,
    loading = false,
    onViewProfile,
    sortState,
    onSort,
}: TherapistTableProps) {
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
            status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';

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

    if (therapists.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th
                            className="text-left p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => onSort('nome')}
                        >
                            <div className="flex items-center gap-2 font-medium">
                                Nome
                                {getSortIcon('nome')}
                            </div>
                        </th>
                        <th
                            className="text-left p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => onSort('especialidade')}
                        >
                            <div className="flex items-center gap-2 font-medium">
                                Especialidade
                                {getSortIcon('especialidade')}
                            </div>
                        </th>
                        <th className="text-left p-4 font-medium">Conselho/Registro</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">E-mail</th>
                        <th className="text-left p-4 font-medium hidden lg:table-cell">Telefone</th>
                        <th
                            className="text-left p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => onSort('status')}
                        >
                            <div className="flex items-center gap-2 font-medium">
                                Status
                                {getSortIcon('status')}
                            </div>
                        </th>
                        <th className="text-right p-4 font-medium">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {therapists.map((therapist) => (
                        <tr key={therapist.id} className="border-t hover:bg-gray-50">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                                        {getInitials(therapist.nome)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{therapist.nome}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="text-sm">
                                    {therapist.especialidade || 'Não informado'}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="text-sm">
                                    <div>{therapist.conselho || 'N/A'}</div>
                                    <div className="text-gray-500 text-xs">
                                        {therapist.registroConselho || 'N/A'}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                                <span className="text-sm">
                                    {therapist.email || 'Não informado'}
                                </span>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                                <span className="text-sm">
                                    {therapist.telefone || 'Não informado'}
                                </span>
                            </td>
                            <td className="p-4">{getStatusBadge(therapist.status)}</td>
                            <td className="p-4 text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onViewProfile(therapist)}
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
    );
}
