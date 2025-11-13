import { PlayCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitleHub } from '@/components/ui/card';
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
    };

    const handleOpen = () => {
        onOpen(program.id);
    };

    return (
        <Card
            padding="hub"
            className="cursor-pointer hover:shadow-md transition-shadow rounded-lg border-0 shadow-none"
            style={{ backgroundColor: 'var(--hub-card-background)' }}
            onClick={handleOpen}
            aria-label={`Abrir programa ${program.title} do cliente ${program.patientName}`}
        >
            <CardHeader className="space-y-3 pb-3">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <CardTitleHub className="text-base mb-1">
                            {program.title || 'Sem nome'}
                        </CardTitleHub>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {program.objective}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 flex-shrink-0"
                        onClick={handleNewSession}
                        aria-label="Nova sessão"
                    >
                        <PlayCircle className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
                {/* Descrição do objetivo a curto prazo */}
                {program.goalDescription && (
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            Descrição do objetivo:
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {program.goalDescription}
                        </p>
                    </div>
                )}

                {/* Descrição da aplicação */}
                {program.stimuliApplicationDescription && (
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            Como aplicar:
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {program.stimuliApplicationDescription}
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Última sessão: {formatDate(program.lastSession)}
                    </div>
                    <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                            program.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                        {program.status === 'active' ? 'Ativo' : 'Arquivado'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
