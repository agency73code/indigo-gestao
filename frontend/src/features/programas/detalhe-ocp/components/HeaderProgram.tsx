import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProgramDetail } from '../types';

interface HeaderProgramProps {
    program: ProgramDetail;
}

export default function HeaderProgram({ program }: HeaderProgramProps) {
    const [imageLoading, setImageLoading] = useState(true);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateInput: string | Date) => {
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const corrected = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return corrected.toLocaleDateString('pt-BR');
    } catch {
        return String(dateInput);
    }
    };

    const parseLocalDate = (dateString: string) => {
        const d = new Date(dateString);
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    };

    const daysLeftInfo = () => {
        if (!program.prazoInicio || !program.prazoFim) return null;

        const now = new Date();
        const end = parseLocalDate(program.prazoFim);
        const start = parseLocalDate(program.prazoInicio);
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (isNaN(diff)) return null;
        const status = now > end ? 'finalizado' : `restam ${diff} dias`;
        const period = `${formatDate(start)} — ${formatDate(end)}`;
        return { status, period };
    };

    const prazo = daysLeftInfo();
    return (
        <Card 
            padding="hub"
            className="rounded-lg border-0 shadow-none" 
            style={{ backgroundColor: 'var(--hub-card-background)' }}
            data-print-block
        >
            <CardContent className="space-y-4">
                {/* Informações do Paciente */}
                <div 
                    className="flex items-center gap-3 p-4 border border-border/40 dark:border-white/15 rounded-lg"
                    style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                >
                    <div className="flex-shrink-0">
                        <Avatar className="w-12 h-12 rounded-full">
                            {imageLoading && program.patientPhotoUrl && (
                                <Skeleton className="h-12 w-12 rounded-full absolute inset-0" />
                            )}
                            {program.patientPhotoUrl ? (
                                <AvatarImage
                                    src={program.patientPhotoUrl.startsWith('/api')
                                        ? `${import.meta.env.VITE_API_BASE ?? ''}${program.patientPhotoUrl}`
                                        : program.patientPhotoUrl}
                                    alt={`Foto de ${program.patientName}`}
                                    className={imageLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}
                                    onLoad={() => setImageLoading(false)}
                                />
                            ) : null}
                            <AvatarFallback className="bg-purple-100 text-purple-600 rounded-full">
                                {getInitials(program.patientName)}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base">{program.patientName}</p>
                        {program.patientGuardian && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Responsável: {program.patientGuardian}
                            </p>
                        )}
                        {program.patientAge && (
                            <p className="text-xs text-muted-foreground">
                                {program.patientAge} anos
                            </p>
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
                            <Calendar className="h-3 w-3" /> Criado em:
                        </span>
                        <span className="font-medium">{formatDate(program.createdAt)}</span>
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
                <div className="pt-2 border-t border-border/40 dark:border-white/15 flex items-center justify-between text-sm">
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
