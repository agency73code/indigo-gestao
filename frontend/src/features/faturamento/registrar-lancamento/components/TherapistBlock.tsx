import { UserCheck, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Therapist } from '../types';

interface TherapistBlockProps {
    therapist: Therapist | null;
    onTherapistSelect: (therapist: Therapist | null) => void;
    onShowTherapistSelector: () => void;
}

// Função para gerar iniciais
const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export default function TherapistBlock({ 
    therapist, 
    onTherapistSelect, 
    onShowTherapistSelector 
}: TherapistBlockProps) {
    return (
        <Card className="rounded-[5px] px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Terapeuta
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                {therapist ? (
                    <div className="flex items-center gap-3 p-2 sm:p-3 bg-muted rounded-[5px]">
                        {/* Avatar do terapeuta */}
                        <div className="flex-shrink-0">
                            {therapist.photoUrl ? (
                                <img
                                    src={therapist.photoUrl}
                                    alt={`Foto de ${therapist.name}`}
                                    className="w-12 h-12 rounded-full object-cover"
                                    width={48}
                                    height={48}
                                />
                            ) : (
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                                    {getInitials(therapist.name)}
                                </div>
                            )}
                        </div>

                        {/* Informações do terapeuta */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium">{therapist.name}</p>
                            {therapist.specialization && (
                                <p className="text-sm text-muted-foreground">
                                    {therapist.specialization}
                                </p>
                            )}
                            {therapist.email && (
                                <p className="text-xs text-muted-foreground">
                                    {therapist.email}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2 flex-shrink-0 flex-col sm:flex-row">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onShowTherapistSelector}
                                className="text-xs sm:text-sm"
                            >
                                Trocar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onTherapistSelect(null)}
                                className="text-xs sm:text-sm"
                            >
                                Limpar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        className="w-full h-12"
                        size="lg"
                        onClick={onShowTherapistSelector}
                    >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Selecionar terapeuta
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}