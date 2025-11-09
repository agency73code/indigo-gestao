// Componente de visualização de detalhe de sessão TO
// Mostra cabeçalho, objetivo, parâmetros clínicos, duração, desempenho e arquivos

import { ArrowLeft, Calendar, User, Target, CheckCircle, XCircle, MinusCircle, Clock, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ToSessionDetail, ToAchieved } from '../types';
import type { Patient } from '@/features/programas/consultar-programas/types';

interface ToSessionDetailViewProps {
    session: ToSessionDetail;
    patient: Patient;
    onBack?: () => void;
}

function getAchievedConfig(achieved: ToAchieved) {
    const configs = {
        sim: {
            icon: CheckCircle,
            label: 'Conseguiu realizar o objetivo',
            color: 'text-green-700',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-500/40',
        },
        nao: {
            icon: XCircle,
            label: 'Não conseguiu realizar o objetivo',
            color: 'text-red-700',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-500/40',
        },
        parcial: {
            icon: MinusCircle,
            label: 'Realizou parcialmente o objetivo',
            color: 'text-amber-700',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            borderColor: 'border-amber-500/40',
        },
        nao_aplica: {
            icon: MinusCircle,
            label: 'Não se aplica',
            color: 'text-muted-foreground',
            bgColor: 'bg-muted/40',
            borderColor: 'border-muted',
        },
    };
    return configs[achieved];
}

export default function ToSessionDetailView({
    session,
    patient,
    onBack,
}: ToSessionDetailViewProps) {
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const achievedConfig = getAchievedConfig(session.achieved);
    const AchievedIcon = achievedConfig.icon;

    const patientInitials = patient.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="space-y-4">
            {/* Header com botão voltar */}
            <Card className="rounded-[5px]">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onBack}
                                className="h-8 w-8 p-0"
                                aria-label="Voltar"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Sessão de {patient.name}
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Info do paciente */}
                    <div className="flex items-center gap-3 pb-4 border-b">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={patient.photoUrl ?? undefined} alt={patient.name} />
                            <AvatarFallback>{patientInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {patient.age ? `${patient.age} anos` : ''}{' '}
                                {patient.guardianName ? `• ${patient.guardianName}` : ''}
                            </p>
                        </div>
                    </div>

                    {/* Info da sessão */}
                    <div className="grid gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Terapeuta:</span>
                            <span className="text-muted-foreground">{session.therapistName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Data da sessão:</span>
                            <span className="text-muted-foreground">{formatDate(session.date)}</span>
                        </div>
                    </div>

                    {/* Programa e Objetivo */}
                    <div className="space-y-2 pt-2">
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Programa: </span>
                            <span className="text-sm font-semibold">{session.programName}</span>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Objetivo: </span>
                            <span className="text-sm">{session.goalTitle}</span>
                        </div>
                        {session.goalDescription && (
                            <p className="text-sm text-muted-foreground italic">
                                {session.goalDescription}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Parâmetros Clínicos */}
            <Card className="rounded-[5px]">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Parâmetros Clínicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Conseguiu o objetivo? */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Conseguiu realizar o objetivo?</p>
                        <Badge
                            variant="outline"
                            className={`gap-2 px-3 py-1.5 rounded-[5px] ${achievedConfig.bgColor} ${achievedConfig.borderColor} ${achievedConfig.color}`}
                        >
                            <AchievedIcon className="h-4 w-4" />
                            <span className="text-sm">{achievedConfig.label}</span>
                        </Badge>
                    </div>

                    {/* Frequência */}
                    {session.frequency != null && session.frequency > 0 && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Frequência</p>
                            <p className="text-sm text-muted-foreground">
                                Realizou o objetivo <span className="font-semibold">{session.frequency}</span> vez(es)
                            </p>
                        </div>
                    )}

                    {/* Duração */}
                    {session.durationMin != null && session.durationMin > 0 && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm font-medium">Duração da atividade</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Cliente permaneceu <span className="font-semibold">{session.durationMin} minutos</span> realizando o objetivo
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Descrição do Desempenho */}
            <Card className="rounded-[5px]">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Descrição do Desempenho
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {session.performanceNotes}
                    </p>
                </CardContent>
            </Card>

            {/* Outras Observações Clínicas */}
            {session.clinicalNotes && session.clinicalNotes.trim().length > 0 && (
                <Card className="rounded-[5px]">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Outras Observações Clínicas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {session.clinicalNotes}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Arquivos anexados */}
            {session.attachments && session.attachments.length > 0 && (
                <Card className="rounded-[5px]">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Arquivos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {session.attachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="text-sm truncate">{attachment.name}</span>
                                        {attachment.type && (
                                            <Badge variant="outline" className="text-xs shrink-0">
                                                {attachment.type}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 ml-2 shrink-0"
                                        asChild
                                    >
                                        <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Baixar arquivo"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

