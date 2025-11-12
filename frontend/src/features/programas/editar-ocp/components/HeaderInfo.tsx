import { Calendar, User, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProgramDetail } from '../types';

interface HeaderInfoProps {
    program: ProgramDetail;
}

export default function HeaderInfo({ program }: HeaderInfoProps) {
    const [imageLoading, setImageLoading] = useState(true);
    const [therapistImageLoading, setTherapistImageLoading] = useState(true);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-4 ">
            {/* Informações do Cliente */}
            <Card padding="small" className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="flex items-center gap-3 p-2 sm:p-3 bg-muted rounded-md">
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
                            <p className="font-medium">{program.patientName}</p>
                            {program.patientGuardian && (
                                <p className="text-sm text-muted-foreground">
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
                </CardContent>
            </Card>

            {/* Informações do Terapeuta */}
            <Card padding="small" className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Terapeuta
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="flex items-center gap-3 p-2 sm:p-3 bg-muted rounded-md">
                        <div className="flex-shrink-0">
                            <Avatar className="w-12 h-12 rounded-full">
                                {therapistImageLoading && program.therapistPhotoUrl && (
                                    <Skeleton className="h-12 w-12 rounded-full absolute inset-0" />
                                )}
                                {program.therapistPhotoUrl ? (
                                    <AvatarImage
                                        src={program.therapistPhotoUrl.startsWith('/api')
                                            ? `${import.meta.env.VITE_API_BASE ?? ''}${program.therapistPhotoUrl}`
                                            : program.therapistPhotoUrl}
                                        alt={`Foto de ${program.therapistName}`}
                                        className={therapistImageLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}
                                        onLoad={() => setTherapistImageLoading(false)}
                                    />
                                ) : null}
                                <AvatarFallback className="bg-blue-100 text-blue-600 rounded-full">
                                    {getInitials(program.therapistName)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium">{program.therapistName}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data de criação */}
            <Card padding="small" className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Informações do Programa
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Criado em:</span>
                            <span className="font-medium">{formatDate(program.createdAt)}</span>
                        </div>

                        {program.name && (
                            <div className="pt-2 border-t">
                                <p className="text-sm text-muted-foreground mb-1">
                                    Nome do programa:
                                </p>
                                <p className="font-medium text-sm">{program.name}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
