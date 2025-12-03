import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { Patient, MusiProgramDetail } from '../types';

interface MusiHeaderSessionInfoProps {
    patient: Patient;
    program: MusiProgramDetail;
}

export default function MusiHeaderSessionInfo({ patient, program }: MusiHeaderSessionInfoProps) {
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

    const prazo = daysLeftInfo();

    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
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
                            <AvatarFallback className="bg-amber-100 text-amber-600 rounded-full">
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
                        <span className="font-medium">
                            {new Date().toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </div>

                {/* Prazo */}
                {prazo && (
                    <div className="text-xs text-muted-foreground text-center">
                        Prazo: {prazo.period} ({prazo.status})
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
