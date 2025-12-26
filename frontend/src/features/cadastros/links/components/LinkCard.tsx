import { MoreVertical, Calendar, User, Plus } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LinkCardProps, PatientTherapistLink } from '../types';
import { getSpecialtyColors } from '@/utils/specialtyColors';

// Helper para formatar datas
function formatDate(dateString?: string | null): string {
    if (!dateString) return 'Data não informada';

    // tenta converter diretamente para Date
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return 'Data inválida';

    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();

    return `${day}/${month}/${year}`;
}

// Helper para obter iniciais do nome
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0]?.toUpperCase() ?? '')
        .slice(0, 2)
        .join('');
}

// Helper para traduzir status
function getStatusBadge(status: string) {
    const statusConfig = {
        active: { 
            label: 'Ativo', 
            className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        },
        ended: { 
            label: 'Encerrado', 
            className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        },
        archived: { 
            label: 'Arquivado', 
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        },
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
}

// Helper para pegar o cargo do terapeuta
function getTherapistRole(therapist: any): string | null {
    return therapist?.dadosProfissionais?.[0]?.cargo || null;
}

// Helper para calcular idade a partir da data de nascimento
function calculateAge(birthDate?: string | null): number | null {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

export default function LinkCard({
    patientWithLinks,
    therapistWithLinks,
    supervisorWithLinks,
    viewBy,
    patients,
    therapists,
    onEdit,
    onAddTherapist,
    onAddPatient,
    onTransferResponsible,
    onEndLink,
    onArchive,
    onReactivate,
    onEndSupervision,
    onArchiveSupervision,
    onReactivateSupervision,
    onToggleSupervisionScope,
    onAddTherapistToSupervisor,
    onBulkEndSupervision,
    onBulkArchiveSupervision,
    onBulkReactivateSupervision,
    onBulkEndLinks,
    onBulkArchiveLinks,
    onBulkReactivateLinks,
}: LinkCardProps) {
    if (viewBy === 'patient' && patientWithLinks) {
        return renderPatientCard(
            patientWithLinks,
            therapists,
            onAddTherapist,
            onEndLink,
            onArchive,
            onReactivate,
            onBulkEndLinks,
            onBulkArchiveLinks,
            onBulkReactivateLinks,
        );
    }

    if (viewBy === 'therapist' && therapistWithLinks) {
        return renderTherapistCard(
            therapistWithLinks,
            patients,
            onEdit,
            onAddPatient,
            onTransferResponsible,
            onEndLink,
            onArchive,
            onReactivate,
            onBulkEndLinks,
            onBulkArchiveLinks,
            onBulkReactivateLinks,
        );
    }

    if (viewBy === 'supervision' && supervisorWithLinks) {
        return renderSupervisionCard(
            supervisorWithLinks,
            therapists,
            onEndSupervision,
            onArchiveSupervision,
            onReactivateSupervision,
            onToggleSupervisionScope,
            onBulkEndSupervision,
            onBulkArchiveSupervision,
            onBulkReactivateSupervision,
            onAddTherapistToSupervisor,
        );
    }

    return null;
}

// Renderiza card consolidado por paciente
function renderPatientCard(
    { patient, links }: { patient: any; links: PatientTherapistLink[] },
    therapists: any[],
    onAddTherapist: (patientId: string) => void,
    onEndLink: (link: PatientTherapistLink) => void,
    onArchive: (link: PatientTherapistLink) => void,
    onReactivate: (link: PatientTherapistLink) => void,
    onBulkEnd?: (links: PatientTherapistLink[]) => void,
    onBulkArchive?: (links: PatientTherapistLink[]) => void,
    onBulkReactivate?: (links: PatientTherapistLink[]) => void,
) {
    const [imageLoading, setImageLoading] = useState(true);
    
    // Separar vínculos por status
    const activeLinks = links.filter((link) => link.status === 'active');
    const endedLinks = links.filter((link) => link.status === 'ended');
    const archivedLinks = links.filter((link) => link.status === 'archived');

    const hasActiveLinks = activeLinks.length > 0;
    const hasEndedLinks = endedLinks.length > 0;
    const hasArchivedLinks = archivedLinks.length > 0;

    const responsibleLinks = activeLinks.filter(
        (link) => link.role === 'responsible'
    );
    const coTherapistLinks = activeLinks.filter((link) => link.role === 'co');

    // Data de início do vínculo responsável ou mais antigo
    const startDate = (() => {
        const sortedResponsible = responsibleLinks
            .filter((l) => l.startDate)
            .sort(
                (a, b) =>
                    new Date(a.startDate!).getTime() -
                    new Date(b.startDate!).getTime(),
            );

        if (sortedResponsible.length > 0) {
            return sortedResponsible[0].startDate;
        }

        const sortedAll = [...links]
            .filter((l) => l.startDate)
            .sort(
                (a, b) =>
                    new Date(a.startDate!).getTime() -
                    new Date(b.startDate!).getTime(),
            );

        return sortedAll[0]?.startDate;
    })();

    // Status geral do paciente
    const overallStatus = hasActiveLinks
        ? 'active'
        : links.some((link) => link.status === 'ended')
          ? 'ended'
          : 'archived';
    const statusBadge = getStatusBadge(overallStatus);

    const patientInitials = getInitials(patient.nome);
    const age = calculateAge(patient.dataNascimento);

    return (
        <Card className="rounded-lg hover:shadow-md transition-shadow h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Avatar do paciente */}
                        <Avatar className="h-12 w-12">
                            {imageLoading && patient.avatarUrl && (
                                <Skeleton className="h-12 w-12 rounded-full absolute inset-0" />
                            )}
                            <AvatarImage 
                                src={patient.avatarUrl || undefined } 
                                alt={patient.nome}
                                className={imageLoading ? 'object-cover opacity-0' : 'object-cover opacity-100 transition-opacity duration-300'}
                                onLoad={() => setImageLoading(false)}
                            />
                            <AvatarFallback className="text-sm font-medium">
                                {patientInitials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            {/* Nome do paciente e idade */}
                            <CardTitleHub className="text-base truncate">
                                {patient.nome}
                            </CardTitleHub>
                            {age !== null && (
                                <p className="text-sm text-muted-foreground">{age} anos</p>
                            )}
                        </div>
                    </div>

                    {/* Status geral e menu */}
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 font-medium rounded-full ${statusBadge.className}`}>
                            {statusBadge.label}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    aria-label="Mais ações"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60">
                                <DropdownMenuItem onClick={() => onAddTherapist(patient.id)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Terapeuta
                                </DropdownMenuItem>

                                {hasActiveLinks && onBulkEnd && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onBulkEnd(activeLinks)}
                                        >
                                            Encerrar todos os vínculos ativos
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {hasEndedLinks && (
                                    <>
                                        <DropdownMenuSeparator />
                                        {onBulkReactivate && (
                                            <DropdownMenuItem
                                                onClick={() => onBulkReactivate(endedLinks)}
                                            >
                                                Reativar todos os vínculos encerrados
                                            </DropdownMenuItem>
                                        )}
                                        {onBulkArchive && (
                                            <DropdownMenuItem
                                                onClick={() => onBulkArchive(endedLinks)}
                                            >
                                                Arquivar todos os vínculos encerrados
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                )}

                                {hasArchivedLinks && onBulkReactivate && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onBulkReactivate(archivedLinks)}
                                        >
                                            Reativar todos os vínculos arquivados
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 flex flex-col h-full">
                {/* Lista de terapeutas vinculados */}
                <div className="space-y-4 flex-1">
                    {/* Terapeutas Ativos */}
                    {hasActiveLinks && (
                        <div className="space-y-2">
                            <CardTitleHub className="text-sm" style={{ fontWeight: 400 }}>
                                Terapeuta(s) Ativo(s):
                            </CardTitleHub>
                            <div className="space-y-2">
                                {responsibleLinks.map((link) => (
                                    <TherapistChip
                                        key={link.id}
                                        link={link}
                                        therapists={therapists}
                                        onEndLink={onEndLink}
                                        onArchive={onArchive}
                                        onReactivate={onReactivate}
                                    />
                                ))}

                                {coTherapistLinks.map((link) => (
                                    <TherapistChip
                                        key={link.id}
                                        link={link}
                                        therapists={therapists}
                                        onEndLink={onEndLink}
                                        onArchive={onArchive}
                                        onReactivate={onReactivate}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Terapeutas Encerrados */}
                    {hasEndedLinks && (
                        <div className="space-y-2 opacity-70">
                            <h4 className="text-xs font-medium text-muted-foreground">
                                Terapeuta(s) Encerrado(s):
                            </h4>
                            <div className="space-y-2">
                                {endedLinks.map((link) => (
                                    <TherapistChip
                                        key={link.id}
                                        link={link}
                                        therapists={therapists}
                                        onEndLink={onEndLink}
                                        onArchive={onArchive}
                                        onReactivate={onReactivate}
                                        isEnded
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Terapeutas Arquivados */}
                    {hasArchivedLinks && (
                        <div className="space-y-2 opacity-50">
                            <h4 className="text-xs font-medium text-muted-foreground">
                                Terapeuta(s) Arquivado(s):
                            </h4>
                            <div className="space-y-2">
                                {archivedLinks.map((link) => (
                                    <TherapistChip
                                        key={link.id}
                                        link={link}
                                        therapists={therapists}
                                        onEndLink={onEndLink}
                                        onArchive={onArchive}
                                        onReactivate={onReactivate}
                                        isArchived
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nenhum terapeuta */}
                    {!hasActiveLinks && !hasEndedLinks && !hasArchivedLinks && (
                        <p className="text-sm text-muted-foreground italic">
                            Nenhum terapeuta vinculado
                        </p>
                    )}
                </div>

                {/* Metadados - Fixo na parte inferior */}
                {startDate && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t mt-4">
                        <span>{links.length} terapeuta(s)</span>
                        <span>•</span>
                        <span className="capitalize">{statusBadge.label}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Componente para chip do terapeuta (usado no card do cliente)
function TherapistChip({
    link,
    therapists,
    onEndLink,
    onArchive,
    onReactivate,
    isEnded = false,
    isArchived = false,
}: {
    link: PatientTherapistLink;
    therapists: any[];
    onEndLink: (link: PatientTherapistLink) => void;
    onArchive: (link: PatientTherapistLink) => void;
    onReactivate: (link: PatientTherapistLink) => void;
    isEnded?: boolean;
    isArchived?: boolean;
}) {
    const therapist = therapists.find((t) => t.id === link.therapistId);
    const therapistName = therapist?.nome || 'Carregando...';
    const therapistCargo = getTherapistRole(therapist);

    return (
        <div className={`grid grid-cols-[200px_1fr_auto] items-center gap-4 p-3 rounded-lg ${
            isArchived ? 'bg-muted/10' : isEnded ? 'bg-muted/20' : 'bg-muted/30'
        }`}>
            {/* Coluna 1: Badges de Atuação e Status */}
            <div className="flex flex-wrap gap-1">
                {/* Badge de Área de Atuação - sempre visível para vínculos ativos */}
                {!isEnded && !isArchived && (
                    <span
                        className="text-xs py-1 px-2 flex items-center gap-1 w-fit font-medium rounded-full"
                        style={{
                            backgroundColor: getSpecialtyColors(link.actuationArea).bg,
                            color: getSpecialtyColors(link.actuationArea).text,
                        }}
                    >
                        <User className="h-3 w-3" />
                        {link.actuationArea || 'Atuação não definida'}
                    </span>
                )}
                
                {/* Badge de Data de Início - para vínculos ativos */}
                {!isEnded && !isArchived && link.startDate && (
                    <Badge
                        variant="secondary"
                        className="text-xs py-0.5 px-1.5"
                    >
                        Início {formatDate(link.startDate)}
                    </Badge>
                )}

                {/* Badge de Encerramento */}
                {isEnded && link.endDate && (
                    <Badge
                        variant="destructive"
                        className="text-xs py-0.5 px-1.5"
                    >
                        Encerrado {formatDate(link.endDate)}
                    </Badge>
                )}

                {/* Badge de Arquivado */}
                {isArchived && (
                    <Badge
                        variant="outline"
                        className="text-xs py-0.5 px-1.5"
                    >
                        Arquivado
                    </Badge>
                )}
            </div>

            {/* Coluna 2: Terapeuta (Avatar + Nome + Cargo) */}
            <div className="flex items-center gap-3">
                <Avatar className={`h-8 w-8 ${isEnded || isArchived ? 'opacity-60' : ''}`}>
                    <AvatarImage 
                        src={therapist?.avatarUrl || undefined } 
                        alt={therapist?.nome || therapistName}
                        className='object-cover transition-opacity duration-300'
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {getInitials(therapistName)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className={`text-sm font-medium ${isEnded || isArchived ? 'line-through text-muted-foreground' : ''}`}>
                        {therapistName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {therapistCargo || 'Cargo não definido'}
                    </span>
                </div>
            </div>

            {/* Coluna 3: Menu de Ações */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label="Ações"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    {link.status === 'active' ? (
                        <DropdownMenuItem onClick={() => onEndLink(link)}>
                            Encerrar
                        </DropdownMenuItem>
                    ) : link.status === 'ended' ? (
                        <>
                            <DropdownMenuItem onClick={() => onReactivate(link)}>
                                Reativar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onArchive(link)}>
                                Arquivar
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <DropdownMenuItem onClick={() => onReactivate(link)}>
                            Reativar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

// Renderiza card consolidado por terapeuta
function renderTherapistCard(
    { therapist, links }: { therapist: any; links: PatientTherapistLink[] },
    patients: any[],
    onEdit: (link: PatientTherapistLink) => void,
    onAddPatient: (therapistId: string) => void,
    onTransferResponsible: (link: PatientTherapistLink) => void,
    onEndLink: (link: PatientTherapistLink) => void,
    onArchive: (link: PatientTherapistLink) => void,
    onReactivate: (link: PatientTherapistLink) => void,
    onBulkEnd?: (links: PatientTherapistLink[]) => void,
    onBulkArchive?: (links: PatientTherapistLink[]) => void,
    onBulkReactivate?: (links: PatientTherapistLink[]) => void,
) {
    const activeLinks = links.filter((link) => link.status === 'active');
    const endedLinks = links.filter((link) => link.status === 'ended');
    const archivedLinks = links.filter((link) => link.status === 'archived');

    const hasActiveLinks = activeLinks.length > 0;
    const hasEndedLinks = endedLinks.length > 0;
    const hasArchivedLinks = archivedLinks.length > 0;
    
    const overallStatus = hasActiveLinks
        ? 'active'
        : links.some((link) => link.status === 'ended')
          ? 'ended'
          : 'archived';
    const statusBadge = getStatusBadge(overallStatus);

    const therapistInitials = getInitials(therapist.nome);

    return (
        <Card className="rounded-lg hover:shadow-md transition-shadow h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-12 w-12">
                            <AvatarImage 
                                src={therapist.avatarUrl || undefined } 
                                alt={therapist.nome}
                                className='object-cover transition-opacity duration-300'
                            />
                            <AvatarFallback className="text-sm font-medium">
                                {therapistInitials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <CardTitleHub className="text-base truncate">
                                {therapist.nome}
                            </CardTitleHub>
                            <p className="text-sm text-muted-foreground">
                                {therapist.especialidade || 'Terapeuta'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 font-medium rounded-full ${statusBadge.className}`}>
                            {statusBadge.label}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60">
                                <DropdownMenuItem onClick={() => onAddPatient(therapist.id)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Cliente
                                </DropdownMenuItem>

                                {hasActiveLinks && onBulkEnd && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onBulkEnd(activeLinks)}
                                        >
                                            Encerrar todos os vínculos ativos
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {hasEndedLinks && (
                                    <>
                                        <DropdownMenuSeparator />
                                        {onBulkReactivate && (
                                            <DropdownMenuItem
                                                onClick={() => onBulkReactivate(endedLinks)}
                                            >
                                                Reativar todos os vínculos encerrados
                                            </DropdownMenuItem>
                                        )}
                                        {onBulkArchive && (
                                            <DropdownMenuItem
                                                onClick={() => onBulkArchive(endedLinks)}
                                            >
                                                Arquivar todos os vínculos encerrados
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                )}

                                {hasArchivedLinks && onBulkReactivate && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onBulkReactivate(archivedLinks)}
                                        >
                                            Reativar todos os vínculos arquivados
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                    {/* Clientes Ativos */}
                    {hasActiveLinks && (
                        <div className="space-y-2">
                            <CardTitleHub className="text-sm" style={{ fontWeight: 400 }}>
                                Cliente(s) Ativo(s):
                            </CardTitleHub>
                            <div className="space-y-1">
                                {activeLinks.map((link) => (
                                    <PatientChip
                                        key={link.id}
                                        link={link}
                                        patients={patients}
                                        onEdit={onEdit}
                                        onTransferResponsible={onTransferResponsible}
                                        onEndLink={onEndLink}
                                        onArchive={onArchive}
                                        onReactivate={onReactivate}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clientes Encerrados */}
                    {hasEndedLinks && (
                        <div className="space-y-2 opacity-70">
                            <h4 className="text-xs font-medium text-muted-foreground">
                                Cliente(s) Encerrado(s):
                            </h4>
                            <div className="space-y-1">
                                {endedLinks.map((link) => (
                                    <PatientChip
                                        key={link.id}
                                        link={link}
                                        patients={patients}
                                        onEdit={onEdit}
                                        onTransferResponsible={onTransferResponsible}
                                        onEndLink={onEndLink}
                                        onArchive={onArchive}
                                        onReactivate={onReactivate}
                                        isEnded
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clientes Arquivados */}
                    {hasArchivedLinks && (
                        <div className="space-y-2 opacity-50">
                            <h4 className="text-xs font-medium text-muted-foreground">
                                Cliente(s) Arquivado(s):
                            </h4>
                            <div className="space-y-1">
                                {archivedLinks.map((link) => (
                                    <PatientChip
                                        key={link.id}
                                        link={link}
                                        patients={patients}
                                        onEdit={onEdit}
                                        onTransferResponsible={onTransferResponsible}
                                        onEndLink={onEndLink}
                                        onArchive={onArchive}
                                        onReactivate={onReactivate}
                                        isArchived
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nenhum cliente */}
                    {!hasActiveLinks && !hasEndedLinks && !hasArchivedLinks && (
                        <p className="text-sm text-muted-foreground italic">
                            Nenhum cliente vinculado
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t mt-4">
                    <span>{links.length} cliente(s)</span>
                    <span>•</span>
                    <span className="capitalize">{statusBadge.label}</span>
                </div>
            </CardContent>
        </Card>
    );
}

// Componente para chip do paciente (usado no card do terapeuta)
function PatientChip({
    link,
    patients,
    onEdit,
    onTransferResponsible,
    onEndLink,
    onArchive,
    onReactivate,
    isEnded = false,
    isArchived = false,
}: {
    link: PatientTherapistLink;
    patients: any[];
    onEdit: (link: PatientTherapistLink) => void;
    onTransferResponsible: (link: PatientTherapistLink) => void;
    onEndLink: (link: PatientTherapistLink) => void;
    onArchive: (link: PatientTherapistLink) => void;
    onReactivate: (link: PatientTherapistLink) => void;
    isEnded?: boolean;
    isArchived?: boolean;
}) {
    const patient = patients.find((p) => p.id === link.patientId);
    const patientName = patient?.nome || 'Carregando...';

    // Calcular idade do cliente
    const calculateAge = (birthDate: string | Date | null | undefined) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(patient?.dataNascimento);
    const patientInitials = getInitials(patientName);

    return (
        <div className={`grid grid-cols-[200px_1fr_auto] items-center gap-4 p-3 rounded-lg ${
            isArchived ? 'bg-muted/10' : isEnded ? 'bg-muted/20' : 'bg-muted/30'
        }`}>
            {/* Badges de Status e Especialidade */}
            <div className="flex flex-wrap gap-1">
                {/* Badge de Área de Atuação/Especialidade */}
                {!isEnded && !isArchived && link.actuationArea && (
                    <span
                        className="text-xs py-1 px-2 flex items-center gap-1 w-fit font-medium rounded-full"
                        style={{
                            backgroundColor: getSpecialtyColors(link.actuationArea).bg,
                            color: getSpecialtyColors(link.actuationArea).text,
                        }}
                    >
                        {link.actuationArea}
                    </span>
                )}
                {isEnded && link.endDate && (
                    <Badge
                        variant="destructive"
                        className="text-xs py-0.5 px-1.5"
                    >
                        Encerrado {formatDate(link.endDate)}
                    </Badge>
                )}
                {!isEnded && !isArchived && link.startDate && (
                    <Badge
                        variant="secondary"
                        className="text-xs py-0.5 px-1.5"
                    >
                        Início {formatDate(link.startDate)}
                    </Badge>
                )}
                {isArchived && (
                    <Badge
                        variant="outline"
                        className="text-xs py-0.5 px-1.5"
                    >
                        Arquivado
                    </Badge>
                )}
            </div>

            {/* Informações do Cliente */}
            <div className="flex items-center gap-3">
                <Avatar className={`h-9 w-9 ${isEnded || isArchived ? 'opacity-60' : ''}`}>
                   <AvatarImage 
                        src={patient.avatarUrl || undefined } 
                        alt={patient.nome}
                        className='object-cover transition-opacity duration-300'
                    />
                    <AvatarFallback className="text-xs font-medium">
                        {patientInitials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-1 min-w-0">
                    <span className={`text-sm font-medium truncate ${isEnded || isArchived ? 'line-through text-muted-foreground' : ''}`}>
                        {patientName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {age !== null ? `${age} anos` : 'Idade não informada'}
                    </span>
                </div>
            </div>

            {/* Menu de Ações */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    {link.status === 'active' ? (
                        <>
                            <DropdownMenuItem onClick={() => onEdit(link)}>Editar</DropdownMenuItem>

                            {link.role === 'responsible' && (
                                <DropdownMenuItem onClick={() => onTransferResponsible(link)}>
                                    Transferir
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => onEndLink(link)}>
                                Encerrar
                            </DropdownMenuItem>
                        </>
                    ) : link.status === 'ended' ? (
                        <>
                            <DropdownMenuItem onClick={() => onEdit(link)}>Editar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onReactivate(link)}>
                                Reativar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onArchive(link)}>
                                Arquivar
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <>
                            <DropdownMenuItem onClick={() => onEdit(link)}>Editar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onReactivate(link)}>
                                Reativar
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

// Renderiza card consolidado de supervisão
function renderSupervisionCard(
    { supervisor, links }: { supervisor: any; links: any[] },
    therapists: any[],
    onEnd: (link: any) => void,
    onArchive: (link: any) => void,
    onReactivate: (link: any) => void,
    onToggleScope?: (link: any) => void,
    onBulkEnd?: (links: any[]) => void,
    onBulkArchive?: (links: any[]) => void,
    onBulkReactivate?: (links: any[]) => void,
    onAddTherapist?: (supervisorId: string) => void,
) {
    const supervisorInitials = getInitials(supervisor.nome);
    const activeLinks = links.filter((link) => link.status === 'active');
    const endedLinks = links.filter((link) => link.status === 'ended');
    const archivedLinks = links.filter((link) => link.status === 'archived');
    const hasActiveLinks = activeLinks.length > 0;
    const hasEndedLinks = endedLinks.length > 0;
    const hasArchivedLinks = archivedLinks.length > 0;

    // Separar vínculos ativos diretos e indiretos
    const directLinks = activeLinks.filter((link) => !link.hierarchyLevel || link.hierarchyLevel === 1);
    const indirectLinks = activeLinks.filter((link) => link.hierarchyLevel && link.hierarchyLevel > 1);
    
    // Separar vínculos encerrados diretos e indiretos
    const endedDirectLinks = endedLinks.filter((link) => !link.hierarchyLevel || link.hierarchyLevel === 1);
    const endedIndirectLinks = endedLinks.filter((link) => link.hierarchyLevel && link.hierarchyLevel > 1);

    // Separar vínculos arquivados diretos e indiretos
    const archivedDirectLinks = archivedLinks.filter((link) => !link.hierarchyLevel || link.hierarchyLevel === 1);
    const archivedIndirectLinks = archivedLinks.filter((link) => link.hierarchyLevel && link.hierarchyLevel > 1);

    // Status geral do supervisor
    const overallStatus = hasActiveLinks
        ? 'active'
        : links.some((link) => link.status === 'ended')
          ? 'ended'
          : 'archived';
    const statusBadge = getStatusBadge(overallStatus);

    const supervisorRole = getTherapistRole(supervisor);
    const avatarUrl = supervisor && (supervisor as any).avatarUrl
        ? ((supervisor as any).avatarUrl.startsWith('/api')
            ? `${import.meta.env.VITE_API_BASE ?? ''}${(supervisor as any).avatarUrl}`
            : (supervisor as any).avatarUrl)
        : undefined;

    // Data de início do vínculo mais antigo
    const startDate = links.length > 0
        ? links.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]?.startDate
        : null;

    return (
        <Card className="rounded-lg hover:shadow-md transition-shadow h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Avatar do supervisor */}
                        <Avatar className="h-12 w-12">
                            <AvatarImage
                                src={avatarUrl}
                                alt={supervisor.nome}
                                className='object-cover transition-opacity duration-300'
                            />
                            <AvatarFallback className="text-sm font-medium">
                                {supervisorInitials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            {/* Nome do supervisor */}
                            <CardTitleHub className="text-base truncate">
                                {supervisor.nome}
                            </CardTitleHub>
                            <p className="text-sm text-muted-foreground">
                                {supervisorRole || 'Supervisor'}
                            </p>
                        </div>
                    </div>

                    {/* Status geral e menu */}
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 font-medium rounded-full ${statusBadge.className}`}>
                            {statusBadge.label}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    aria-label="Mais ações"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                {onAddTherapist && (
                                    <>
                                        <DropdownMenuItem onClick={() => onAddTherapist(supervisor.id)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Adicionar Terapeuta
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}

                                {hasActiveLinks && (
                                    <>
                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (onBulkEnd) {
                                                    onBulkEnd(activeLinks);
                                                } else {
                                                    activeLinks.forEach((link) => onEnd(link));
                                                }
                                            }}
                                        >
                                            Encerrar todos os vínculos
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {hasEndedLinks && (
                                    <>
                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (onBulkReactivate) {
                                                    onBulkReactivate(endedLinks);
                                                } else {
                                                    endedLinks.forEach((link) => onReactivate(link));
                                                }
                                            }}
                                        >
                                            Reativar todos os encerrados
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (onBulkArchive) {
                                                    onBulkArchive(endedLinks);
                                                } else {
                                                    endedLinks.forEach((link) => onArchive(link));
                                                }
                                            }}
                                        >
                                            Arquivar todos os encerrados
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {hasArchivedLinks && (
                                    <>
                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            onClick={() => {
                                                if (onBulkReactivate) {
                                                    onBulkReactivate(archivedLinks);
                                                } else {
                                                    archivedLinks.forEach((link) => onReactivate(link));
                                                }
                                            }}
                                        >
                                            Reativar todos os arquivados
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 flex flex-col h-full">
                {/* Lista de terapeutas supervisionados */}
                <div className="space-y-4 flex-1">
                    {/* Supervisionados Ativos Diretos */}
                    {directLinks.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-foreground">
                                Supervisão Direta ({directLinks.length}):
                            </h4>
                            {directLinks.map((link) => (
                                <SupervisedTherapistChip
                                    key={link.id}
                                    link={link}
                                    therapists={therapists}
                                    onEnd={onEnd}
                                    onArchive={onArchive}
                                    onReactivate={onReactivate}
                                    onToggleScope={onToggleScope}
                                />
                            ))}
                        </div>
                    )}

                    {/* Supervisionados Ativos Indiretos */}
                    {indirectLinks.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-foreground">
                                Supervisão Indireta ({indirectLinks.length}):
                            </h4>
                            {indirectLinks.map((link) => (
                                <SupervisedTherapistChip
                                    key={link.id}
                                    link={link}
                                    therapists={therapists}
                                    onEnd={onEnd}
                                    onArchive={onArchive}
                                    onReactivate={onReactivate}
                                    onToggleScope={onToggleScope}
                                />
                            ))}
                        </div>
                    )}

                    {/* Supervisionados Encerrados - Visual diferenciado */}
                    {hasEndedLinks && (
                        <div className="space-y-2 pt-3 border-t border-dashed opacity-60">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <span>Vínculos Encerrados ({endedLinks.length})</span>
                            </h4>
                            
                            {/* Encerrados Diretos */}
                            {endedDirectLinks.length > 0 && (
                                <div className="space-y-2 pl-2">
                                    <p className="text-xs text-muted-foreground">
                                        Supervisão Direta ({endedDirectLinks.length}):
                                    </p>
                                    {endedDirectLinks.map((link) => (
                                        <SupervisedTherapistChip
                                            key={link.id}
                                            link={link}
                                            therapists={therapists}
                                            onEnd={onEnd}
                                            onArchive={onArchive}
                                            onReactivate={onReactivate}
                                            onToggleScope={onToggleScope}
                                            isEnded
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Encerrados Indiretos */}
                            {endedIndirectLinks.length > 0 && (
                                <div className="space-y-2 pl-2">
                                    <p className="text-xs text-muted-foreground">
                                        Supervisão Indireta ({endedIndirectLinks.length}):
                                    </p>
                                    {endedIndirectLinks.map((link) => (
                                        <SupervisedTherapistChip
                                            key={link.id}
                                            link={link}
                                            therapists={therapists}
                                            onEnd={onEnd}
                                            onArchive={onArchive}
                                            onReactivate={onReactivate}
                                            onToggleScope={onToggleScope}
                                            isEnded
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Supervisionados Arquivados - Visual ainda mais discreto */}
                    {hasArchivedLinks && (
                        <div className="space-y-2 pt-3 border-t border-dashed opacity-40">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <span>Vínculos Arquivados ({archivedLinks.length})</span>
                            </h4>
                            
                            {/* Arquivados Diretos */}
                            {archivedDirectLinks.length > 0 && (
                                <div className="space-y-2 pl-2">
                                    <p className="text-xs text-muted-foreground">
                                        Supervisão Direta ({archivedDirectLinks.length}):
                                    </p>
                                    {archivedDirectLinks.map((link) => (
                                        <SupervisedTherapistChip
                                            key={link.id}
                                            link={link}
                                            therapists={therapists}
                                            onEnd={onEnd}
                                            onArchive={onArchive}
                                            onReactivate={onReactivate}
                                            onToggleScope={onToggleScope}
                                            isArchived
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Arquivados Indiretos */}
                            {archivedIndirectLinks.length > 0 && (
                                <div className="space-y-2 pl-2">
                                    <p className="text-xs text-muted-foreground">
                                        Supervisão Indireta ({archivedIndirectLinks.length}):
                                    </p>
                                    {archivedIndirectLinks.map((link) => (
                                        <SupervisedTherapistChip
                                            key={link.id}
                                            link={link}
                                            therapists={therapists}
                                            onEnd={onEnd}
                                            onArchive={onArchive}
                                            onReactivate={onReactivate}
                                            onToggleScope={onToggleScope}
                                            isArchived
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Nenhum terapeuta */}
                    {activeLinks.length === 0 && endedLinks.length === 0 && archivedLinks.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                            Nenhum terapeuta supervisionado
                        </p>
                    )}
                </div>

                {/* Metadados - Fixo na parte inferior */}
                {startDate && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 mt-4 border-t">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Desde {formatDate(startDate)}</span>
                        </div>
                        <span>•</span>
                        <span>
                            {activeLinks.length} ativo{activeLinks.length !== 1 ? 's' : ''}
                            {indirectLinks.length > 0 && ` (${directLinks.length} direto${directLinks.length !== 1 ? 's' : ''}, ${indirectLinks.length} indireto${indirectLinks.length !== 1 ? 's' : ''})`}
                            {hasEndedLinks && `, ${endedLinks.length} encerrado${endedLinks.length !== 1 ? 's' : ''}`}
                            {hasArchivedLinks && `, ${archivedLinks.length} arquivado${archivedLinks.length !== 1 ? 's' : ''}`}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Componente para chip do terapeuta supervisionado (seguindo padrão de TherapistChip)
function SupervisedTherapistChip({
    link,
    therapists,
    onEnd,
    onArchive,
    onReactivate,
    onToggleScope,
    isEnded = false,
    isArchived = false,
}: {
    link: any;
    therapists: any[];
    onEnd: (link: any) => void;
    onArchive: (link: any) => void;
    onReactivate: (link: any) => void;
    onToggleScope?: (link: any) => void;
    isEnded?: boolean;
    isArchived?: boolean;
}) {
    const therapist = therapists.find((t) => t.id === link.supervisedTherapistId);

    if (!therapist) {
        return null;
    }

    const therapistInitials = getInitials(therapist.nome);
    const therapistRole = getTherapistRole(therapist);
    const therapistAvatarUrl = (therapist as any).avatarUrl
        ? ((therapist as any).avatarUrl.startsWith('/api')
            ? `${import.meta.env.VITE_API_BASE ?? ''}${(therapist as any).avatarUrl}`
            : (therapist as any).avatarUrl)
        : undefined;

    // Determinar área de atuação
    const actuationArea = link.actuationArea || therapist.dadosProfissionais?.[0]?.areaAtuacao || 'Supervisão';
    
    // Determinar escopo de supervisão
    const supervisionScope = link.supervisionScope || 'direct';
    const scopeLabels = {
        direct: 'Direta',
        team: 'Equipe',
    };
    const scopeLabel = scopeLabels[supervisionScope as keyof typeof scopeLabels] || 'Direta';
    
    // Nível hierárquico
    const hierarchyLevel = link.hierarchyLevel || 1;
    const isIndirect = hierarchyLevel > 1;

    return (
        <div className={`grid grid-cols-[200px_1fr_auto] items-center gap-4 p-3 rounded-lg ${
            isArchived ? 'bg-muted/10 opacity-50' : isEnded ? 'bg-muted/20 opacity-70' : 'bg-muted/30'
        }`}>
            {/* Coluna 1: Badges de Atuação e Escopo */}
            <div className="flex flex-wrap gap-1">
                <span
                    className={`text-xs py-1 px-2 flex items-center gap-1 w-fit font-medium rounded-full ${isEnded || isArchived ? 'opacity-60' : ''}`}
                    style={{
                        backgroundColor: getSpecialtyColors(actuationArea).bg,
                        color: getSpecialtyColors(actuationArea).text,
                    }}
                >
                    <User className="h-3 w-3" />
                    {actuationArea}
                </span>
                {isIndirect && (
                    <Badge
                        variant="outline"
                        className={`text-xs py-0.5 flex items-center p-1 gap-1 w-fit ${isEnded || isArchived ? 'opacity-60' : ''}`}
                    >
                        Nível {hierarchyLevel}
                    </Badge>
                )}
                {supervisionScope !== 'direct' && (
                    <Badge
                        variant="default"
                        className={`text-xs py-0.5 flex items-center p-1 gap-1 w-fit ${isEnded || isArchived ? 'opacity-60' : ''}`}
                    >
                        {scopeLabel}
                    </Badge>
                )}
                {isEnded && link.endDate && (
                    <Badge
                        variant="destructive"
                        className="text-xs py-0.5 flex items-center p-1 gap-1 w-fit opacity-80"
                    >
                        Encerrado {formatDate(link.endDate)}
                    </Badge>
                )}
                {!isEnded && !isArchived && link.startDate && (
                    <Badge
                        variant="secondary"
                        className="text-xs py-0.5 flex items-center p-1 gap-1 w-fit"
                    >
                        Início {formatDate(link.startDate)}
                    </Badge>
                )}
                {isArchived && (
                    <Badge
                        variant="outline"
                        className="text-xs py-0.5 flex items-center p-1 gap-1 w-fit opacity-60"
                    >
                        Arquivado
                    </Badge>
                )}
            </div>

            {/* Coluna 2: Terapeuta (Avatar + Nome + Cargo) */}
            <div className="flex items-center gap-3">
                <Avatar className={`h-8 w-8 ${isEnded || isArchived ? 'opacity-60' : ''}`}>
                    <AvatarImage
                        src={therapistAvatarUrl}
                        alt={therapist.nome}
                        className='object-cover transition-opacity duration-300'
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {therapistInitials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className={`text-sm font-medium ${isEnded || isArchived ? 'line-through text-muted-foreground' : ''}`}>
                        {therapist.nome}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {therapistRole || 'Cargo não definido'}
                    </span>
                </div>
            </div>

            {/* Coluna 3: Menu de Ações */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label="Ações"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {link.status === 'active' && (
                        <>
                            {onToggleScope && (
                                <>
                                    <DropdownMenuItem onClick={() => onToggleScope(link)}>
                                        Alternar para {link.supervisionScope === 'direct' ? 'Supervisão de Equipe' : 'Supervisão Direta'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem onClick={() => onEnd(link)}>
                                Encerrar
                            </DropdownMenuItem>
                        </>
                    )}
                    {link.status === 'ended' && (
                        <>
                            <DropdownMenuItem onClick={() => onReactivate(link)}>
                                Reativar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onArchive(link)}>
                                Arquivar
                            </DropdownMenuItem>
                        </>
                    )}
                    {link.status === 'archived' && (
                        <DropdownMenuItem onClick={() => onReactivate(link)}>
                            Reativar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
