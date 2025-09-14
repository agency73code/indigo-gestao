import { Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { ProgramDetail } from '../types';

interface ActionBarProps {
    program: ProgramDetail;
}

export default function ActionBar({ program }: ActionBarProps) {
    const navigate = useNavigate();

    const handleRegisterSession = () => {
        navigate(`/programas/sessoes/nova?programaId=${program.id}&patientId=${program.patientId}`);
    };

    const handleEditProgram = () => {
        navigate(`/programas/${program.id}/editar`);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-10">
            <div className="max-w-lg mx-auto p-4">
                <div className="flex gap-3">
                    <Button
                        onClick={handleRegisterSession}
                        className="flex-1 h-12 text-sm font-medium"
                        size="lg"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Sessão
                    </Button>

                    <Button
                        onClick={handleEditProgram}
                        variant="outline"
                        className="flex-1 h-12 text-sm font-medium"
                        size="lg"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Programa
                    </Button>
                </div>
            </div>
        </div>
    );
}
