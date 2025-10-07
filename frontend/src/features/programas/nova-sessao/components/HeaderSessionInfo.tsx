import { ArrowLeft, Calendar, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import type { Patient, ProgramDetail } from '../types';

interface HeaderSessionInfoProps {
    patient: Patient;
    program: ProgramDetail;
}

export default function HeaderSessionInfo({ patient, program }: HeaderSessionInfoProps) {
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
        // Se tem programa e paciente, volta para o detalhe do programa
        if (program.id && patient.id) {
            navigate(`/app/programas/${program.id}?patientId=${patient.id}`);
        } else {
            // Caso contrário, volta para a lista de programas
            navigate('/app/programas');
        }
    };

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
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Registrar nova Sessão
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6 space-y-4">
                {/* Informações do Paciente */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <div className="flex-shrink-0">
                        <Avatar className="w-12 h-12">
                            {patient.photoUrl ? (
                                <AvatarImage
                                    src={patient.photoUrl}
                                    alt={`Foto de ${patient.name}`}
                                />
                            ) : null}
                            <AvatarFallback className="bg-purple-100 text-purple-600">
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

                {/* Informações do Terapeuta e Data */}
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Terapeuta:</span>
                        <span className="font-medium">{program.therapistName}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Data da sessão:
                        </span>
                        <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                    </div>
                </div>

                {/* Nome do Programa */}
                {program.name && (
                    <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Nome do programa:</p>
                        <p className="font-medium text-sm">{program.name}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
