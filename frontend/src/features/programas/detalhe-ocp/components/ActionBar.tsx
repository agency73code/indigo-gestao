import { Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActionBar from '@/components/ui/action-bar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ProgramDetail } from '../types';

interface ProgramActionBarProps {
    program: ProgramDetail;
}

export default function ProgramActionBar({ program }: ProgramActionBarProps) {
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
        <ActionBar>
            <Button
                onClick={handleRegisterSession}
                className="h-11 rounded-full gap-2"
            >
                <Plus className="h-4 w-4" />
                Registrar Sessão
            </Button>

            <Button
                onClick={handleEditProgram}
                variant="outline"
                className="h-11 rounded-full gap-2"
            >
                <Edit className="h-4 w-4" />
                Editar Programa
            </Button>
        </ActionBar>
    );
}
