import { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, User } from 'lucide-react';
import { Button } from '@/ui/button';
import type { Therapist, SortState } from '../types/consultas.types';

interface AvatarWithSkeletonProps {
    src: string;
    alt: string;
    initials: string;
    size?: 'sm' | 'md';
}

const AvatarWithSkeleton = ({ src, alt, initials, size = 'md' }: AvatarWithSkeletonProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const sizeClasses = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';

    // Se não tem src, mostrar iniciais diretamente
    if (!src) {
        return (
            <div className={`${sizeClasses} bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600`}>
                {initials}
            </div>
        );
    }

    const fullSrc = src.startsWith('/api')
        ? `${import.meta.env.VITE_API_BASE ?? ''}${src}`
        : src;

    if (imageError) {
        return (
            <div className={`${sizeClasses} bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600`}>
                {initials}
            </div>
        );
    }

    return (
        <div className={`relative ${sizeClasses}`}>
            {!imageLoaded && (
                <div className={`absolute inset-0 bg-muted rounded-full animate-pulse`} />
            )}
            <img
                src={fullSrc}
                alt={alt}
                className={`${sizeClasses} rounded-full object-cover transition-opacity duration-200 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                referrerPolicy="no-referrer"
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                    setImageError(true);
                    setImageLoaded(false);
                }}
            />
        </div>
    );
};

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
    <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
            <div
                key={index}
                className="border rounded-lg p-4 animate-pulse flex flex-col gap-3 md:grid md:grid-cols-[auto,1fr,1fr,1fr,auto] md:items-center"
            >
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-24" />
                </div>
                <div className="h-4 bg-muted rounded w-28 md:block hidden" />
                <div className="h-4 bg-muted rounded w-28 md:block hidden" />
                <div className="h-8 bg-muted rounded w-20 self-end md:self-center" />
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
            status === 'ATIVO'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';

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
        <div className="border rounded-[5px] p">
            <div className="md:hidden divide-y">
                {therapists.map((therapist) => (
                    <div key={therapist.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                {therapist.avatarUrl ? (
                                    <AvatarWithSkeleton
                                        src={therapist.avatarUrl}
                                        alt={therapist.nome}
                                        initials={getInitials(therapist.nome)}
                                        size="md"
                                    />
                                ) : (
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                                        {getInitials(therapist.nome)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-sm text-foreground">
                                        {therapist.nome}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {therapist.especialidade || 'Não informado'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-semibold text-foreground block text-xs mb-1">
                                    Status
                                </span>
                                {getStatusBadge(therapist.status)}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 text-xs text-muted-foreground">
                            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
                                <div>
                                    <span className="font-semibold text-foreground block text-xs">
                                        Email
                                    </span>
                                    <span className="block text-sm text-foreground">
                                        {therapist.email || 'Não informado'}
                                    </span>
                                </div>
                                <div className="sm:text-right">
                                    <span className="font-semibold text-foreground block text-xs">
                                        Conselho
                                    </span>
                                    <span className="block text-sm text-foreground">
                                        {therapist.conselho || 'N/A'}
                                    </span>
                                    <span>{therapist.registroConselho || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto] sm:items-center">
                                <div>
                                    <span className="font-semibold text-foreground block text-xs">
                                        Telefone
                                    </span>
                                    <span className="block text-sm text-foreground">
                                        {therapist.telefone || 'Não informado'}
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewProfile(therapist)}
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
                            <th
                                className="text-left p-4 cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={() => onSort('especialidade')}
                            >
                                <div className="flex items-center gap-2 font-medium">
                                    Especialidade
                                    {getSortIcon('especialidade')}
                                </div>
                            </th>
                            <th className="text-left p-4 font-medium">Conselho/Registro</th>
                            <th className="text-left p-4 font-medium hidden lg:table-cell">
                                E-mail
                            </th>
                            <th className="text-left p-4 font-medium hidden xl:table-cell">
                                Telefone
                            </th>
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
                        {therapists.map((therapist) => (
                            <tr
                                key={therapist.id}
                                className="border-t hover:bg-muted/50 transition-colors"
                            >
                                <td className="p-4 align-top">
                                    <div className="flex items-center gap-3">
                                        {therapist.avatarUrl ? (
                                            <AvatarWithSkeleton
                                                src={therapist.avatarUrl}
                                                alt={therapist.nome}
                                                initials={getInitials(therapist.nome)}
                                                size="sm"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                                                {getInitials(therapist.nome)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-sm text-foreground wrap-break-word">
                                                {therapist.nome}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <span className="text-sm text-foreground wrap-break-word">
                                        {therapist.especialidade || 'Não informado'}
                                    </span>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="text-sm text-foreground wrap-break-word">
                                        <div>{therapist.conselho || 'N/A'}</div>
                                        <div className="text-muted-foreground text-xs">
                                            {therapist.registroConselho || 'N/A'}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 hidden lg:table-cell align-top">
                                    <span className="text-sm text-foreground wrap-break-word">
                                        {therapist.email || 'Não informado'}
                                    </span>
                                </td>
                                <td className="p-4 hidden xl:table-cell align-top">
                                    <span className="text-sm text-foreground wrap-break-word">
                                        {therapist.telefone || 'Não informado'}
                                    </span>
                                </td>
                                <td className="p-4 align-top">
                                    {getStatusBadge(therapist.status)}
                                </td>
                                <td className="p-4 text-right align-top">
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
        </div>
    );
}
