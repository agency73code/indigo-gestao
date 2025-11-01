import { MoreVertical, Calendar, UserCheck, User, Plus } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { isSupervisorRole } from '../../constants/access-levels';

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
    const statusMap = {
        active: { label: 'Ativo', variant: 'default' as const },
        ended: { label: 'Encerrado', variant: 'secondary' as const },
        archived: { label: 'Arquivado', variant: 'outline' as const },
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.active;
}

// Helper para pegar o cargo do terapeuta
function getTherapistRole(therapist: any): string | null {
    return therapist?.dadosProfissionais?.[0]?.cargo || null;
}

// Helper para calcular idade a partir da data de nascimento
function calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
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
    onTransferResponsible,
    onEndLink,
    onArchive,
    onEditSupervision,
    onEndSupervision,
    onArchiveSupervision,
}: LinkCardProps) {
    if (viewBy === 'patient' && patientWithLinks) {
        return renderPatientCard(
            patientWithLinks,
            therapists,
            onEdit,
            onAddTherapist,
            onTransferResponsible,
            onEndLink,
            onArchive,
        );
    }

    if (viewBy === 'therapist' && therapistWithLinks) {
        return renderTherapistCard(
            therapistWithLinks,
            patients,
            therapists,
            onEdit,
            onTransferResponsible,
            onEndLink,
            onArchive,
        );
    }

    if (viewBy === 'supervision' && supervisorWithLinks) {
        return renderSupervisionCard(
            supervisorWithLinks,
            therapists,
            onEditSupervision,
            onEndSupervision,
            onArchiveSupervision,
        );
    }

    return null;
}

// Renderiza card consolidado por paciente
function renderPatientCard(
    { patient, links }: { patient: any; links: PatientTherapistLink[] },
    therapists: any[],
    onEdit: (link: PatientTherapistLink) => void,
    onAddTherapist: (patientId: string) => void,
    onTransferResponsible: (link: PatientTherapistLink) => void,
    onEndLink: (link: PatientTherapistLink) => void,
    onArchive: (link: PatientTherapistLink) => void,
) {
    const [imageLoading, setImageLoading] = useState(true);
    const responsibleLink = links.find(
        (link) => link.role === 'responsible' && link.status === 'active',
    );
    const coTherapistLinks = links.filter((link) => link.role === 'co' && link.status === 'active');

    // Data de início do vínculo responsável ou mais antigo
    const startDate =
        responsibleLink?.startDate ||
        links.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]
            ?.startDate;

    // Status geral do paciente
    const hasActiveLinks = links.some((link) => link.status === 'active');
    const overallStatus = hasActiveLinks
        ? 'active'
        : links.some((link) => link.status === 'ended')
          ? 'ended'
          : 'archived';
    const statusBadge = getStatusBadge(overallStatus);

    const patientInitials = getInitials(patient.nome);
    const age = calculateAge(patient.dataNascimento);

    return (
        <Card className="rounded-[5px] hover:shadow-md transition-shadow h-full flex flex-col">
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
                            <h3
                                className="font-medium text-base text-foreground truncate"
                                style={{ fontFamily: 'Sora, sans-serif' }}
                            >
                                {patient.nome}
                            </h3>
                            <p className="text-sm text-muted-foreground">{age} anos</p>
                        </div>
                    </div>

                    {/* Status geral e menu */}
                    <div className="flex items-center gap-2">
                        <Badge variant={statusBadge.variant} className="text-xs">
                            {statusBadge.label}
                        </Badge>

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
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => onEdit(links[0])}>
                                    Editar vínculos
                                </DropdownMenuItem>

                                {responsibleLink && (
                                    <DropdownMenuItem
                                        onClick={() => onTransferResponsible(responsibleLink)}
                                    >
                                        Transferir responsável
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => onAddTherapist(patient.id)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar terapeuta
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {hasActiveLinks && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            links.forEach(
                                                (link) =>
                                                    link.status === 'active' && onEndLink(link),
                                            )
                                        }
                                    >
                                        Encerrar vínculos
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => links.forEach(onArchive)}>
                                    Arquivar tudo
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 flex flex-col h-full">
                {/* Lista de terapeutas vinculados */}
                <div className="space-y-3 flex-1">
                    <h4 className="text-sm font-medium text-foreground">Terapeutas vinculados:</h4>

                    <div className="space-y-2">
                        {responsibleLink && (
                            <TherapistChip
                                link={responsibleLink}
                                therapists={therapists}
                                onEdit={onEdit}
                                onTransferResponsible={onTransferResponsible}
                                onEndLink={onEndLink}
                                onArchive={onArchive}
                            />
                        )}

                        {coTherapistLinks.map((link) => (
                            <TherapistChip
                                key={link.id}
                                link={link}
                                therapists={therapists}
                                onEdit={onEdit}
                                onTransferResponsible={onTransferResponsible}
                                onEndLink={onEndLink}
                                onArchive={onArchive}
                            />
                        ))}

                        {!responsibleLink && coTherapistLinks.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">
                                Nenhum terapeuta ativo
                            </p>
                        )}
                    </div>
                </div>

                {/* Metadados - Fixo na parte inferior */}
                {startDate && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 mt-4 border-t">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Desde {formatDate(startDate)}</span>
                        </div>
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
    onEdit,
    onTransferResponsible,
    onEndLink,
    onArchive,
}: {
    link: PatientTherapistLink;
    therapists: any[];
    onEdit: (link: PatientTherapistLink) => void;
    onTransferResponsible: (link: PatientTherapistLink) => void;
    onEndLink: (link: PatientTherapistLink) => void;
    onArchive: (link: PatientTherapistLink) => void;
}) {
    const therapist = therapists.find((t) => t.id === link.therapistId);
    const therapistName = therapist?.nome || `Terapeuta ${link.therapistId}`;
    const therapistCargo = getTherapistRole(therapist);
    const isResponsible = therapistCargo ? isSupervisorRole(therapistCargo) : link.role === 'responsible';

    return (
        <div className="grid grid-cols-[200px_1fr_auto] items-center gap-4 p-3 bg-muted/30 rounded-[5px]">
            {/* Coluna 1: Badge de Atuação */}
            <Badge
                variant={isResponsible ? 'default' : 'secondary'}
                className="text-xs py-0.5 flex items-center p-1 gap-1 w-fit"
            >
                {isResponsible ? <UserCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {link.actuationArea || 'Atuação não definida'}
            </Badge>

            {/* Coluna 2: Terapeuta (Avatar + Nome + Cargo) */}
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage 
                        src={therapist.avatarUrl || undefined } 
                        alt={therapist.nome}
                        className='object-cover transition-opacity duration-300'
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {getInitials(therapistName)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{therapistName}</span>
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
                    <DropdownMenuItem onClick={() => onEdit(link)}>Editar</DropdownMenuItem>

                    {link.status === 'active' && (
                        <>
                            {isResponsible && (
                                <DropdownMenuItem onClick={() => onTransferResponsible(link)}>
                                    Transferir
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => onEndLink(link)}>
                                Encerrar
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuItem onClick={() => onArchive(link)}>Arquivar</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

// Renderiza card consolidado por terapeuta
function renderTherapistCard(
    { therapist, links }: { therapist: any; links: PatientTherapistLink[] },
    patients: any[],
    therapists: any[],
    onEdit: (link: PatientTherapistLink) => void,
    onTransferResponsible: (link: PatientTherapistLink) => void,
    onEndLink: (link: PatientTherapistLink) => void,
    onArchive: (link: PatientTherapistLink) => void,
) {
    const activeLinks = links.filter((link) => link.status === 'active');

    const hasActiveLinks = activeLinks.length > 0;
    const overallStatus = hasActiveLinks
        ? 'active'
        : links.some((link) => link.status === 'ended')
          ? 'ended'
          : 'archived';
    const statusBadge = getStatusBadge(overallStatus);

    const therapistInitials = getInitials(therapist.nome);

    return (
        <Card className="rounded-[5px] hover:shadow-md transition-shadow h-full flex flex-col">
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
                            <h3
                                className="font-medium text-base text-foreground truncate"
                                style={{ fontFamily: 'Sora, sans-serif' }}
                            >
                                {therapist.nome}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {therapist.especialidade || 'Terapeuta'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant={statusBadge.variant} className="text-xs">
                            {statusBadge.label}
                        </Badge>

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
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => onEdit(links[0])}>
                                    Gerenciar Clientes
                                </DropdownMenuItem>

                                {hasActiveLinks && (
                                    <>
                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            onClick={() =>
                                                activeLinks.forEach((link) => onEndLink(link))
                                            }
                                        >
                                            Encerrar todos os vínculos
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={() =>
                                                activeLinks.forEach((link) => onArchive(link))
                                            }
                                        >
                                            Arquivar todos
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                    <h4 className="text-sm font-medium text-foreground">
                        Cliente(s):
                    </h4>

                    <div className="space-y-1">
                        {activeLinks.length > 0 ? (
                            activeLinks.map((link) => (
                                <PatientChip
                                    key={link.id}
                                    link={link}
                                    patients={patients}
                                    therapists={therapists}
                                    onEdit={onEdit}
                                    onTransferResponsible={onTransferResponsible}
                                    onEndLink={onEndLink}
                                    onArchive={onArchive}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic">
                                Nenhum cliente ativo
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t mt-4">
                    <span>{activeLinks.length} cliente(s)</span>
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
    therapists,
    onEdit,
    onTransferResponsible,
    onEndLink,
    onArchive,
}: {
    link: PatientTherapistLink;
    patients: any[];
    therapists: any[];
    onEdit: (link: PatientTherapistLink) => void;
    onTransferResponsible: (link: PatientTherapistLink) => void;
    onEndLink: (link: PatientTherapistLink) => void;
    onArchive: (link: PatientTherapistLink) => void;
}) {
    const patient = patients.find((p) => p.id === link.patientId);
    const patientName = patient?.nome || `Cliente ${link.patientId}`;

    // Obter terapeuta para verificar o cargo
    const therapist = therapists.find((t) => t.id === link.therapistId);
    const therapistCargo = getTherapistRole(therapist);
    const isSupervisor = therapistCargo ? isSupervisorRole(therapistCargo) : false;

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
        <div className="grid grid-cols-[200px_1fr_auto] items-center gap-4 p-3 bg-muted/30 rounded-[5px]">
            {/* Badge de Área de Atuação */}
            <Badge
                variant={isSupervisor ? 'default' : 'secondary'}
                className="text-xs py-0.5 flex items-center p-1 gap-1 w-fit"
            >
                {isSupervisor ? <UserCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {link.actuationArea || 'Atuação não definida'}
            </Badge>

            {/* Informações do Cliente */}
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                   <AvatarImage 
                        src={patient.avatarUrl || undefined } 
                        alt={patient.nome}
                        className='object-cover transition-opacity duration-300'
                    />
                    <AvatarFallback className="text-xs font-medium">
                        {patientInitials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{patientName}</span>
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
                    <DropdownMenuItem onClick={() => onEdit(link)}>Editar</DropdownMenuItem>

                    {link.status === 'active' && (
                        <>
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
                    )}

                    <DropdownMenuItem onClick={() => onArchive(link)}>Arquivar</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

// Renderiza card consolidado de supervisão
function renderSupervisionCard(
    { supervisor, links }: { supervisor: any; links: any[] },
    therapists: any[],
    onEdit: (link: any) => void,
    onEnd: (link: any) => void,
    onArchive: (link: any) => void,
) {
    const supervisorInitials = getInitials(supervisor.nome);
    const activeLinks = links.filter((link) => link.status === 'active');
    const hasActiveLinks = activeLinks.length > 0;

    // Separar vínculos diretos e indiretos baseado no hierarchyLevel
    const directLinks = activeLinks.filter((link) => !link.hierarchyLevel || link.hierarchyLevel === 1);
    const indirectLinks = activeLinks.filter((link) => link.hierarchyLevel && link.hierarchyLevel > 1);

    // Status geral do supervisor
    const overallStatus = hasActiveLinks
        ? 'active'
        : links.some((link) => link.status === 'ended')
          ? 'ended'
          : 'archived';
    const statusBadge = getStatusBadge(overallStatus);

    const supervisorRole = getTherapistRole(supervisor);
    const avatarUrl = (supervisor as any).avatarUrl
        ? ((supervisor as any).avatarUrl.startsWith('/api')
            ? `${import.meta.env.VITE_API_BASE ?? ''}${(supervisor as any).avatarUrl}`
            : (supervisor as any).avatarUrl)
        : undefined;

    // Data de início do vínculo mais antigo
    const startDate = links.length > 0
        ? links.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]?.startDate
        : null;

    return (
        <Card className="rounded-[5px] hover:shadow-md transition-shadow h-full flex flex-col">
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
                            <h3
                                className="font-medium text-base text-foreground truncate"
                                style={{ fontFamily: 'Sora, sans-serif' }}
                            >
                                {supervisor.nome}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {supervisorRole || 'Supervisor'}
                            </p>
                        </div>
                    </div>

                    {/* Status geral e menu */}
                    <div className="flex items-center gap-2">
                        <Badge variant={statusBadge.variant} className="text-xs">
                            {statusBadge.label}
                        </Badge>

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
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => onEdit(links[0])}>
                                    Gerenciar Terapeutas
                                </DropdownMenuItem>

                                {hasActiveLinks && (
                                    <>
                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            onClick={() =>
                                                activeLinks.forEach((link) => onEnd(link))
                                            }
                                        >
                                            Encerrar todos os vínculos
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={() =>
                                                activeLinks.forEach((link) => onArchive(link))
                                            }
                                        >
                                            Arquivar todos
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
                <div className="space-y-3 flex-1">
                    {/* Supervisionados Diretos */}
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
                                    onEdit={onEdit}
                                    onEnd={onEnd}
                                    onArchive={onArchive}
                                />
                            ))}
                        </div>
                    )}

                    {/* Supervisionados Indiretos */}
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
                                    onEdit={onEdit}
                                    onEnd={onEnd}
                                    onArchive={onArchive}
                                />
                            ))}
                        </div>
                    )}

                    {/* Nenhum terapeuta ativo */}
                    {activeLinks.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                            Nenhum terapeuta supervisionado ativo
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
                            {activeLinks.length} {activeLinks.length === 1 ? 'terapeuta' : 'terapeutas'}
                            {indirectLinks.length > 0 && ` (${directLinks.length} direto${directLinks.length !== 1 ? 's' : ''}, ${indirectLinks.length} indireto${indirectLinks.length !== 1 ? 's' : ''})`}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{statusBadge.label}</span>
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
    onEdit,
    onEnd,
    onArchive,
}: {
    link: any;
    therapists: any[];
    onEdit: (link: any) => void;
    onEnd: (link: any) => void;
    onArchive: (link: any) => void;
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
        <div className="grid grid-cols-[200px_1fr_auto] items-center gap-4 p-3 bg-muted/30 rounded-[5px]">
            {/* Coluna 1: Badges de Atuação e Escopo */}
            <div className="flex flex-wrap gap-1">
                <Badge
                    variant="secondary"
                    className="text-xs py-0.5 flex items-center p-1 gap-1 w-fit"
                >
                    <User className="h-3 w-3" />
                    {actuationArea}
                </Badge>
                {isIndirect && (
                    <Badge
                        variant="outline"
                        className="text-xs py-0.5 flex items-center p-1 gap-1 w-fit"
                    >
                        Nível {hierarchyLevel}
                    </Badge>
                )}
                {supervisionScope !== 'direct' && (
                    <Badge
                        variant="default"
                        className="text-xs py-0.5 flex items-center p-1 gap-1 w-fit"
                    >
                        {scopeLabel}
                    </Badge>
                )}
            </div>

            {/* Coluna 2: Terapeuta (Avatar + Nome + Cargo) */}
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
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
                    <span className="text-sm font-medium">{therapist.nome}</span>
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
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEdit(link)}>Editar</DropdownMenuItem>

                    {link.status === 'active' && (
                        <>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => onEnd(link)}>
                                Encerrar
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuItem onClick={() => onArchive(link)}>Arquivar</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
