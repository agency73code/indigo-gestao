import { ArrowLeft, Calendar, User, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import type { ProgramDetail } from '../types';

interface HeaderInfoProps {
    program: ProgramDetail;
}

export default function HeaderInfo({ program }: HeaderInfoProps) {
    const navigate = useNavigate();

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

    const handleGoBack = () => {
        navigate(`/app/programas/${program.id}`);
    };

    return (
        <div className="space-y-4 ">
            {/* Header com botão voltar */}
            <Card padding="small" className="rounded-[5px]">
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
                        <CardTitle className="text-base">Editar Programa</CardTitle>
                    </div>
                </CardHeader>
            </Card>

            {/* Informações do Paciente */}
            <Card padding="small" className="rounded-[5px]">
                <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Paciente
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 sm:pb-6">
                    <div className="flex items-center gap-3 p-2 sm:p-3 bg-muted rounded-md">
                        <div className="flex-shrink-0">
                            <Avatar className="w-12 h-12">
                                {program.patientPhotoUrl ? (
                                    <AvatarImage
                                        src={program.patientPhotoUrl}
                                        alt={`Foto de ${program.patientName}`}
                                    />
                                ) : null}
                                <AvatarFallback className="bg-purple-100 text-purple-600">
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
