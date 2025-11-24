import { Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActionBar from '@/components/ui/action-bar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toRoutes } from '../config';

interface ToProgramActionBarProps {
    program: {
        id: string;
        patientId: string;
    };
}

export default function ToProgramActionBar({ program }: ToProgramActionBarProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleRegisterSession = () => {
        navigate(toRoutes.newSession(program.id, program.patientId));
    };

    const handleEditProgram = () => {
        const patientId = searchParams.get('patientId');
        const path = toRoutes.edit(program.id);
        const url = patientId ? `${path}?patientId=${patientId}` : path;

        console.log('[ToProgramActionBar] Navegando para:', url);
        console.log('[ToProgramActionBar] Program ID:', program.id);
        console.log('[ToProgramActionBar] Path from toRoutes.edit:', path);

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
