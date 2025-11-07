import { ArrowLeft, Calendar, Brain, Clock } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import type { Patient, ProgramDetail } from '../types';

interface HeaderSessionInfoProps {
    patient: Patient;
    program: ProgramDetail;
}

export default function HeaderSessionInfo({ patient, program }: HeaderSessionInfoProps) {
    const navigate = useNavigate();
    const [imageLoading, setImageLoading] = useState(true);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        // evita o deslocamento de fuso: lê apenas a parte da data
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    const daysLeftInfo = () => {
        if (!program.prazoInicio || !program.prazoFim) return null;

        const now = new Date();
        const end = new Date(program.prazoFim);
        const start = new Date(program.prazoInicio);
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (isNaN(diff)) return null;
        const status = now > end ? 'finalizado' : `restam ${diff} dias`;
        const period = `${formatDate(start.toISOString())} — ${formatDate(end.toISOString())}`;
        return { status, period };
    };

    const handleGoBack = () => {
        // Se tem programa e paciente, volta para o detalhe do programa
        if (program.id && patient.id) {
            navigate(`/app/programas/${program.id}?patientId=${patient.id}`);
        } else {
            // Caso contrário, volta para a lista de programas
            navigate('/app/programas');
        }
    };

    const prazo = daysLeftInfo();

    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <div className="flex items-center gap-2 mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGoBack}
                        className="h-8 w-8 p-0"
                        aria-label="Voltar"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-1xl font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Registrar nova Sessão
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
                {/* Informações do Paciente */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <div className="shrink-0">
                        <Avatar className="w-12 h-12 rounded-full">
                            {imageLoading && patient.photoUrl && (
                                <Skeleton className="h-12 w-12 rounded-full absolute inset-0" />
                            )}
                            {patient.photoUrl ? (
                                <AvatarImage
                                    src={patient.photoUrl.startsWith('/api')
                                        ? `${import.meta.env.VITE_API_BASE ?? ''}${patient.photoUrl}`
                                        : patient.photoUrl}
                                    alt={`Foto de ${patient.name}`}
                                    className={imageLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}
                                    onLoad={() => setImageLoading(false)}
                                />
                            ) : null}
                            <AvatarFallback className="bg-purple-100 text-purple-600 rounded-full">
                                {getInitials(patient.name)}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">{patient.name}</p>
                        {patient.guardianName && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Responsável: {patient.guardianName}
                            </p>
                        )}
                        {patient.age && (
                            <p className="text-xs text-muted-foreground">{patient.age} anos</p>
                        )}
                    </div>
                </div>

                {/* Terapeuta e Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Terapeuta:</span>
                        <span className="font-medium">{program.therapistName}</span>
                    </div>
                    <div className="flex items-center justify sm:justify-end">
                        <span className="text-muted-foreground flex items-center gap-1 mr-2">
                            <Calendar className="h-3 w-3" /> Data da sessão:
                        </span>
                        <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                    </div>
                </div>

                {/* Nome do Programa */}
                {program.name && (
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Nome do programa:</p>
                        <p className="font-medium text-sm">{program.name}</p>
                    </div>
                )}

                {/* Prazo do Programa */}
                <div className="pt-2 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Prazo do programa
                    </span>
                    <span className="font-medium text-right">
                        {program.prazoInicio && program.prazoFim && prazo ? (
                            <>
                                {prazo.period}
                                <span className="block text-xs text-muted-foreground">
                                    {prazo.status}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-muted-foreground">Não definido</span>
                                <span className="block text-xs text-muted-foreground">
                                    Configure nas edições do programa
                                </span>
                            </>
                        )}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
