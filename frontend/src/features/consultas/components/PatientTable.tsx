import { useState, memo } from 'react';
import { ArrowUpRight, Users } from 'lucide-react';
import { Button } from '@/ui/button';
import type { Patient, SortState } from '../types/consultas.types';

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

const PatientTable = memo(function PatientTable({
    patients,
    loading = false,
    onViewProfile,
}: PatientTableProps) {
    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-3 py-1 text-xs font-medium rounded-full';
        const normalizedStatus = status?.toUpperCase() || '';
        const isActive = normalizedStatus === 'ATIVO';
        const statusClasses = isActive
            ? 'bg-[#D8F2E3] text-[#065F46]'
            : 'bg-[#FBDDDF] text-[#991B1B]';
        
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

    if (patients.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="flex flex-col min-h-0 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--table-bg)' }}>
            {/* Tabela Desktop */}
            <div className="hidden md:block overflow-auto scroll-pt-16">    
                <table className="w-full">
                    <thead className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: 'var(--table-header-bg)' }}>
                        <tr>
                            <th className="text-left p-4 font-medium text-xs first:rounded-tl-lg" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text-secondary)' }}>
                                Nome
                            </th>
                            <th className="text-left p-4 font-medium text-xs" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text-secondary)' }}>
                                Idade
                            </th>
                            <th className="text-left p-4 font-medium text-xs" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text-secondary)' }}>
                                Telefone
                            </th>
                            <th className="text-left p-4 font-medium text-xs" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text-secondary)' }}>
                                Responsável
                            </th>
                            <th className="text-left p-4 font-medium text-xs" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text-secondary)' }}>
                                Status
                            </th>
                            <th className="text-center p-4 font-medium text-xs last:rounded-tr-lg" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text-secondary)' }}>
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--table-border)' }}>
                        {patients.map((patient) => {
                            const age = calculateAge(patient.pessoa?.dataNascimento);
                            return (
                                <tr
                                    key={patient.id}
                                    className="transition-colors"
                                    style={{ 
                                        backgroundColor: 'var(--table-bg)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--table-bg)'}
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <AvatarWithSkeleton
                                                src={patient.avatarUrl}
                                                alt={patient.nome}
                                                initials={getInitials(patient.nome)}
                                                size="sm"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-[14px] truncate" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}>
                                                    {patient.nome}
                                                </div>
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
                                            {patient.telefone || '-'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className="text-[14px] font-normal inline-block px-3 py-0.5 truncate" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--table-text)' }}>
                                            {patient.responsavel || '-'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {getStatusBadge(patient.status)}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewProfile(patient)}
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
            <div className="md:hidden overflow-auto divide-y divide-gray-100">
                {patients.map((patient) => {
                    const age = calculateAge(patient.pessoa?.dataNascimento);
                    return (
                        <div key={patient.id} className="p-4 space-y-3 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <AvatarWithSkeleton
                                        src={patient.avatarUrl}
                                        alt={patient.nome}
                                        initials={getInitials(patient.nome)}
                                        size="md"
                                    />
                                    <div>
                                        <p className="font-medium text-[14px] text-[#1F2937]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                            {patient.nome}
                                        </p>
                                        <p className="text-xs text-[#6B7280]">
                                            {age !== null ? `${age} anos` : 'Idade não informada'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {getStatusBadge(patient.status)}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3 text-xs">
                                <div>
                                    <span className="font-semibold text-[#374151] block text-xs mb-1">
                                        Telefone
                                    </span>
                                    <span className="block text-[14px] font-normal text-[#1F2937]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {patient.telefone || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-[#374151] block text-xs mb-1">
                                        Responsável
                                    </span>
                                    <span className="block text-[14px] font-normal text-[#1F2937]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {patient.responsavel || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewProfile(patient)}
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

export default PatientTable;
