import { MoreVertical, Calendar, UserCheck, User, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LinkCardProps, PatientTherapistLink } from '../types';

// Helper para formatar datas
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
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

// Helper para traduzir papel
function getRoleLabel(role: string) {
    return role === 'responsible' ? 'Responsável' : 'Co-terapeuta';
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
    viewBy,
    patients,
    therapists,
    onEdit,
    onAddTherapist,
    onTransferResponsible,
    onEndLink,
    onArchive,
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
            onEdit,
            onTransferResponsible,
            onEndLink,
            onArchive,
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
                            <AvatarImage src="" alt={patient.nome} />
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
    const isResponsible = link.role === 'responsible';
    const therapist = therapists.find((t) => t.id === link.therapistId);
    const therapistName = therapist?.nome || `Terapeuta ${link.therapistId}`;

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

            {/* Coluna 2: Terapeuta (Avatar + Nome + Papel) */}
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {getInitials(therapistName)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{therapistName}</span>
                    <span className="text-xs text-muted-foreground">{getRoleLabel(link.role)}</span>
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
    onEdit: (link: PatientTherapistLink) => void,
    onTransferResponsible: (link: PatientTherapistLink) => void,
    onEndLink: (link: PatientTherapistLink) => void,
    onArchive: (link: PatientTherapistLink) => void,
) {
    const activeLinks = links.filter((link) => link.status === 'active');
    const responsibleLinks = activeLinks.filter((link) => link.role === 'responsible');
    const coTherapistLinks = activeLinks.filter((link) => link.role === 'co');

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
                            <AvatarImage src="" alt={therapist.nome} />
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
                        Cliente(s) ({activeLinks.length} ativos):
                    </h4>

                    <div className="space-y-1">
                        {activeLinks.length > 0 ? (
                            activeLinks.map((link) => (
                                <PatientChip
                                    key={link.id}
                                    link={link}
                                    patients={patients}
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
                    <span>{responsibleLinks.length} responsável(is)</span>
                    <span>•</span>
                    <span>{coTherapistLinks.length} co-terapeuta(s)</span>
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
}: {
    link: PatientTherapistLink;
    patients: any[];
    onEdit: (link: PatientTherapistLink) => void;
    onTransferResponsible: (link: PatientTherapistLink) => void;
    onEndLink: (link: PatientTherapistLink) => void;
    onArchive: (link: PatientTherapistLink) => void;
}) {
    const isResponsible = link.role === 'responsible';
    const patient = patients.find((p) => p.id === link.patientId);
    const patientName = patient?.nome || `Cliente ${link.patientId}`;

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
            {/* Papel do Terapeuta (Responsável/Co-terapeuta) */}
            <Badge
                variant={isResponsible ? 'default' : 'secondary'}
                className="text-xs py-0.5 flex items-center p-1 gap-1 w-fit"
            >
                {isResponsible ? <UserCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {getRoleLabel(link.role)}
            </Badge>

            {/* Informações do Cliente */}
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt={patientName} />
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
