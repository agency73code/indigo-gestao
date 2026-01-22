import { useState, memo } from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';
import { Button } from '@/ui/button';
import type { AnamneseListItem, SortState } from '../types/anamnese-table.types';

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
            <div className={`${sizeClasses} bg-purple-100 rounded-full flex items-center justify-center font-semibold text-purple-600 shrink-0`}>
                {initials}
            </div>
        );
    }

    const fullSrc = src.startsWith('/api')
        ? `${import.meta.env.VITE_API_BASE ?? ''}${src}`
        : src;

    if (imageError) {
        return (
            <div className={`${sizeClasses} bg-purple-100 rounded-full flex items-center justify-center font-semibold text-purple-600 shrink-0`}>
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

interface AnamneseTableProps {
    anamneses: AnamneseListItem[];
    loading?: boolean;
    onViewProfile: (anamnese: AnamneseListItem) => void;
    sortState: SortState;
    onSort: (field: string) => void;
}

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-normal text-foreground mb-2" style={{fontFamily: "Sora"}}>Nenhuma anamnese encontrada</h3>
        <p className="text-sm text-muted-foreground">
            Tente ajustar os filtros de busca ou cadastre uma nova anamnese.
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

const AnamneseTable = memo(function AnamneseTable({
    anamneses,
    loading = false,
    onViewProfile,
}: AnamneseTableProps) {
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Calcular idade a partir da data de nascimento
    const calculateAge = (birthDate: string | null | undefined): number | null => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (anamneses.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="flex flex-col min-h-0 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--table-bg)' }}>
            {/* Tabela Desktop */}
            <div className="hidden md:block overflow-auto scroll-pt-16">    
                <table className="w-full">
                    <thead className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: 'var(--table-header-bg)' }}>
                        <tr>
                            <th className="text-left p-3 font-medium text-sm first:rounded-tl-lg" style={{ color: 'var(--table-text-secondary)' }}>
                                Nome
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                Idade
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                Telefone
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                Responsável
                            </th>
                            <th className="text-left p-3 font-medium text-sm" style={{ color: 'var(--table-text-secondary)' }}>
                                Status
                            </th>
                            <th className="text-center p-3 font-medium text-sm last:rounded-tr-lg" style={{ color: 'var(--table-text-secondary)' }}>
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {anamneses.map((anamnese, index) => {
                            const age = calculateAge(anamnese.dataNascimento);
                            const rowBg = index % 2 === 0 ? 'var(--table-bg)' : 'var(--table-row-alt)';
                            return (
                                <tr
                                    key={anamnese.id}
                                    className="transition-colors"
                                    style={{ 
                                        backgroundColor: rowBg,
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowBg}
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <AvatarWithSkeleton
                                                src={anamnese.clienteAvatarUrl}
                                                alt={anamnese.clienteNome}
                                                initials={getInitials(anamnese.clienteNome)}
                                                size="sm"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onViewProfile(anamnese)}
                                                    className="font-medium text-[14px] truncate text-left hover:underline cursor-pointer transition-colors"
                                                    style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}
                                                >
                                                    {anamnese.clienteNome}
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="text-[14px] font-normal inline-block px-3 py-0.5" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)', backgroundColor: 'var(--table-badge-bg)', borderRadius: '24px' }}>
                                            {age !== null ? age : '-'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className="text-[14px] font-normal inline-block px-3 py-0.5 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}>
                                            {anamnese.telefone || '-'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className="text-[14px] font-normal inline-block px-3 py-0.5 truncate" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}>
                                            {anamnese.responsavel || '-'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {getStatusBadge(anamnese.status)}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewProfile(anamnese)}
                                            className="hover:bg-transparent hover:underline font-normal gap-2 text-[14px] cursor-pointer group px-4 py-2"
                                            style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}
                                        >
                                            Visualizar
                                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Versão Mobile */}
            <div className="md:hidden overflow-auto">
                {anamneses.map((anamnese, index) => {
                    const age = calculateAge(anamnese.dataNascimento);
                    const rowBg = index % 2 === 0 ? 'var(--table-bg)' : 'var(--table-row-alt)';
                    return (
                        <div key={anamnese.id} className="p-4 space-y-3 hover:bg-gray-50" style={{ backgroundColor: rowBg }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <AvatarWithSkeleton
                                        src={anamnese.clienteAvatarUrl}
                                        alt={anamnese.clienteNome}
                                        initials={getInitials(anamnese.clienteNome)}
                                        size="md"
                                    />
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => onViewProfile(anamnese)}
                                            className="font-medium text-[14px] text-[#1F2937] text-left hover:underline cursor-pointer"
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                        >
                                            {anamnese.clienteNome}
                                        </button>
                                        <p className="text-xs text-[#6B7280]">
                                            {age !== null ? `${age} anos` : 'Idade não informada'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {getStatusBadge(anamnese.status)}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 text-xs">
                                <div>
                                    <span className="font-semibold text-[#374151] block text-xs mb-1">
                                        Telefone
                                    </span>
                                    <span className="block text-[14px] font-normal text-[#1F2937]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {anamnese.telefone || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-[#374151] block text-xs mb-1">
                                        Responsável
                                    </span>
                                    <span className="block text-[14px] font-normal text-[#1F2937]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {anamnese.responsavel || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewProfile(anamnese)}
                                        className="gap-2 text-[#1F2937] hover:text-[#1F2937] hover:bg-transparent hover:underline font-normal text-[14px] cursor-pointer group px-4 py-2"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                        Visualizar
                                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default AnamneseTable;
