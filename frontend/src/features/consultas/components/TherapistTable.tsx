import { useState, memo } from 'react';
import { ChevronUp, ChevronDown, ArrowUpRight, User } from 'lucide-react';
import { Button } from '@/ui/button';
import type { Therapist, SortState } from '../types/consultas.types';

interface AvatarWithSkeletonProps {
    src?: string | null;
    alt: string;
    initials: string;
    size?: 'sm' | 'md';
}

const AvatarWithSkeleton = memo(({ src, alt, initials, size = 'md' }: AvatarWithSkeletonProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const sizeClasses = size === 'sm' ? 'h-8 w-8 min-w-[2rem] text-xs' : 'h-10 w-10 min-w-[2.5rem] text-sm';

    // Se não tem src, mostrar iniciais diretamente
    if (!src) {
        return (
            <div className={`${sizeClasses} bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600 shrink-0`}>
                {initials}
            </div>
        );
    }

    const fullSrc = src.startsWith('/api')
        ? `${import.meta.env.VITE_API_BASE ?? ''}${src}`
        : src;

    if (imageError) {
        return (
            <div className={`${sizeClasses} bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600 shrink-0`}>
                {initials}
            </div>
        );
    }

    return (
        <div className={`relative ${sizeClasses} shrink-0`}>
            {!imageLoaded && (
                <div className={`absolute inset-0 bg-muted rounded-full animate-pulse`} />
            )}
            <img
                src={fullSrc}
                alt={alt}
                className={`absolute inset-0 w-full h-full rounded-full object-cover transition-opacity duration-200 ${
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
});

AvatarWithSkeleton.displayName = 'AvatarWithSkeleton';

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

const TherapistTable = memo(function TherapistTable({
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
        const normalizedStatus = status?.toUpperCase() || '';
        const isActive = normalizedStatus === 'ATIVO';
        const statusClasses = isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        
        const displayText = isActive ? 'Ativo' : 'Inativo';

        return <span className={`${baseClasses} ${statusClasses}`}>{displayText}</span>;
    };

    const getEspecialidadeBadge = (especialidade: string | undefined) => {
        if (!especialidade) return <span className="text-sm" style={{ color: 'var(--table-text)' }}>Não informado</span>;

        const especialidadeColors: Record<string, { bg: string; text: string }> = {
            'Fonoaudiologia': { bg: '#E3F2FD', text: '#4A6A8F' },
            'Psicomotricidade': { bg: '#F3E5F5', text: '#7A6A8F' },
            'Fisioterapia': { bg: '#E8F5E9', text: '#5A8F6A' },
            'Terapia Ocupacional': { bg: '#FFF3E0', text: '#A57A5A' },
            'Psicopedagogia': { bg: '#FCE4EC', text: '#8F6A7A' },
            'Educador Físico': { bg: '#E0F2F1', text: '#5A8F85' },
            'Terapia ABA': { bg: '#F1F8E9', text: '#758F5A' },
            'Musicoterapia': { bg: '#EDE7F6', text: '#7A6AA5' },
            'Pedagogia': { bg: '#FFF9C4', text: '#A5955A' },
            'Neuropsicologia': { bg: '#E1F5FE', text: '#5A7EA5' },
            'Nutrição': { bg: '#FFEBEE', text: '#A56A6A' },
        };

        const colors = especialidadeColors[especialidade] || { 
            bg: 'rgba(25, 22, 29, 0.06)', 
            text: 'var(--table-text)' 
        };

        return (
            <span 
                className="text-[14px] font-normal inline-block px-3 py-1" 
                style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    backgroundColor: colors.bg, 
                    color: colors.text,
                    borderRadius: '24px'
                }}
            >
                {especialidade}
            </span>
        );
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
        <div className="flex flex-col min-h-0 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--table-bg)' }}>
            <div className="md:hidden divide-y" style={{ borderColor: 'var(--table-border)' }}>
                {therapists.map((therapist) => (
                    <div key={therapist.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <AvatarWithSkeleton
                                    src={therapist.avatarUrl}
                                    alt={therapist.nome}
                                    initials={getInitials(therapist.nome)}
                                    size="md"
                                />
                                <div>
                                    <p className="font-medium text-sm text-foreground">
                                        {therapist.nome}
                                    </p>
                                    <div className="mt-1">
                                        {getEspecialidadeBadge(therapist.especialidade)}
                                    </div>
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
                                        <ArrowUpRight className="w-4 h-4" />
                                        Visualizar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-fixed">
                    <colgroup>
                        <col className="w-[23%]" />
                        <col className="w-[18%]" />
                        <col className="w-[17%] hidden lg:table-column" />
                        <col className="w-[15%] hidden xl:table-column" />
                        <col className="w-[6%]" />
                        <col className="w-[14%]" />
                    </colgroup>
                    <thead className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: 'var(--table-header-bg)' }}>
                        <tr>
                            <th
                                className="text-left p-3 cursor-pointer transition-colors first:rounded-tl-lg"
                                style={{ color: 'var(--table-text-secondary)' }}
                                onClick={() => onSort('nome')}
                            >
                                <div className="flex items-center gap-2 font-medium text-sm">
                                    Nome
                                    {getSortIcon('nome')}
                                </div>
                            </th>
                            <th
                                className="text-left p-3 cursor-pointer transition-colors"
                                style={{ color: 'var(--table-text-secondary)' }}
                                onClick={() => onSort('especialidade')}
                            >
                                <div className="flex items-center gap-2 font-medium text-sm">
                                    Especialidade
                                    {getSortIcon('especialidade')}
                                </div>
                            </th>
                            <th className="text-left p-3 font-medium text-sm hidden lg:table-cell" style={{ color: 'var(--table-text-secondary)' }}>
                                Cargo
                            </th>
                            <th className="text-left p-3 font-medium text-sm hidden xl:table-cell" style={{ color: 'var(--table-text-secondary)' }}>
                                Telefone
                            </th>
                            <th
                                className="text-left p-3 cursor-pointer transition-colors"
                                style={{ color: 'var(--table-text-secondary)' }}
                                onClick={() => onSort('status')}
                            >
                                <div className="flex items-center gap-2 font-medium text-sm">
                                    Status
                                    {getSortIcon('status')}
                                </div>
                            </th>
                            <th className="text-center p-3 font-medium text-sm last:rounded-tr-lg" style={{ color: 'var(--table-text-secondary)' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--table-border)' }}>
                        {therapists.map((therapist) => (
                            <tr
                                key={therapist.id}
                                className="transition-colors"
                                style={{ 
                                    backgroundColor: 'var(--table-bg)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--table-bg)'}
                            >
                                <td className="p-3">
                                    <div className="flex items-center gap-2.5">
                                        <AvatarWithSkeleton
                                            src={therapist.avatarUrl}
                                            alt={therapist.nome}
                                            initials={getInitials(therapist.nome)}
                                            size="sm"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-sm break-words" style={{ color: 'var(--table-text)' }}>
                                                {therapist.nome}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3">
                                    {getEspecialidadeBadge(therapist.especialidade)}
                                </td>
                                <td className="p-3 hidden lg:table-cell">
                                    <span className="text-sm break-words" style={{ color: 'var(--table-text)' }}>
                                        {therapist.cargo || 'Não informado'}
                                    </span>
                                </td>
                                <td className="p-3 hidden xl:table-cell">
                                    <span className="text-sm whitespace-nowrap" style={{ color: 'var(--table-text)' }}>
                                        {therapist.telefone || 'Não informado'}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {getStatusBadge(therapist.status)}
                                </td>
                                <td className="p-3 text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewProfile(therapist)}
                                        className="hover:bg-transparent hover:underline font-normal gap-2 text-[14px] cursor-pointer group px-4 py-2"
                                        style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}
                                    >
                                        Visualizar
                                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default TherapistTable;
