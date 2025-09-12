import { PlayCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ProgramListItem } from '../types';

interface ProgramCardProps {
    program: ProgramListItem;
    onOpen: (id: string) => void;
    onNewSession: (id: string) => void;
}

export default function ProgramCard({ program, onOpen, onNewSession }: ProgramCardProps) {
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '—';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return '—';
        }
    };

    const handleNewSession = (e: React.MouseEvent) => {
        e.stopPropagation();
        onNewSession(program.id);

        // Telemetria
        console.log('consult_ocp_new_session_clicked', {
            programId: program.id,
            patientId: program.patientId,
        });
    };

    const handleOpen = () => {
        onOpen(program.id);

        // Telemetria
        console.log('consult_ocp_card_opened', { programId: program.id });
    };

    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow rounded-[5px]"
            onClick={handleOpen}
            aria-label={`Abrir programa ${program.title} do paciente ${program.patientName}`}
        >
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="font-medium text-base">{program.title || 'Sem nome'}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                                {program.objective}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={handleNewSession}
                            aria-label="Nova sessão"
                        >
                            <PlayCircle className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Última sessão: {formatDate(program.lastSession)}
                        </div>
                        <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                program.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {program.status === 'active' ? 'Ativo' : 'Arquivado'}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
