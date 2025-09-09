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
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum paciente encontrado</h3>
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
                <div className="h-4 bg-gray-200 rounded animate-pulse w-[150px]" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-[120px]" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-[60px]" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-[80px]" />
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

    if (patients.length === 0) {
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
                        <th className="text-left p-4 font-medium hidden md:table-cell">E-mail</th>
                        <th className="text-left p-4 font-medium hidden lg:table-cell">Telefone</th>
                        <th className="text-left p-4 font-medium">Responsável</th>
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
                    {patients.map((patient) => (
                        <tr key={patient.id} className="border-t hover:bg-gray-50">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                                        {getInitials(patient.nome)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{patient.nome}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                                <span className="text-sm">{patient.email || 'Não informado'}</span>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                                <span className="text-sm">
                                    {patient.telefone || 'Não informado'}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className="text-sm">{patient.responsavel || 'N/A'}</span>
                            </td>
                            <td className="p-4">{getStatusBadge(patient.status)}</td>
                            <td className="p-4 text-right">
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
    );
}
