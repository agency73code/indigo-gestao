import { Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ProgramDetail } from '../types';

interface ActionBarProps {
    program: ProgramDetail;
}

// Componente reutilizável para os botões de ação
function ActionButtons({
    onRegisterSession,
    onEditProgram,
}: {
    onRegisterSession: () => void;
    onEditProgram: () => void;
}) {
    return (
        <div className="flex gap-3 w-full max-w-sm">
            <Button
                onClick={onRegisterSession}
                className="flex-1 h-12 text-sm font-medium"
                size="lg"
            >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Sessão
            </Button>

            <Button
                onClick={onEditProgram}
                variant="outline"
                className="flex-1 h-12 text-sm font-medium"
                size="lg"
            >
                <Edit className="h-4 w-4 mr-2" />
                Editar Programa
            </Button>
        </div>
    );
}

export default function ActionBar({ program }: ActionBarProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleRegisterSession = () => {
        const params = new URLSearchParams();
        params.set('programaId', program.id);
        params.set('patientId', program.patientId);

        const patientIdFromUrl = searchParams.get('patientId');
        if (patientIdFromUrl) {
            params.set('patientId', patientIdFromUrl);
        }

        navigate(`/app/programas/sessoes/nova?${params.toString()}`);
    };

    const handleEditProgram = () => {
        const patientId = searchParams.get('patientId');
        const path = `/app/programas/${program.id}/editar`;
        const url = patientId ? `${path}?patientId=${patientId}` : path;

        navigate(url);
    };

    return (
        <>
            {/* Variante Mobile - fixa no rodapé */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-t border-border py-3">
                <div className="max-w-lg mx-auto p-4 flex justify-center">
                    <ActionButtons
                        onRegisterSession={handleRegisterSession}
                        onEditProgram={handleEditProgram}
                    />
                </div>
            </div>

            {/* Variante Desktop/Tablet - sticky dentro do container */}
            <div className="hidden md:block sticky bottom-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-t border-border">
                <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-center">
                    <ActionButtons
                        onRegisterSession={handleRegisterSession}
                        onEditProgram={handleEditProgram}
                    />
                </div>
            </div>
        </>
    );
}
