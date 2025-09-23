import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateSessionFabProps {
    disabled?: boolean;
    onClick: () => void;
    patientName?: string;
}

export default function CreateSessionFab({
    disabled = false,
    onClick,
    patientName,
}: CreateSessionFabProps) {
    const ariaLabel = patientName
        ? `Adicionar sessão para ${patientName}`
        : 'Selecionar paciente para adicionar sessão';

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
            <Button
                size="lg"
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                onClick={onClick}
                disabled={disabled}
                aria-label={ariaLabel}
            >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
        </div>
    );
}
