import { User, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    variant: 'no-patient' | 'no-programs';
    patientName?: string;
    hasFilters?: boolean;
    onPrimaryAction?: () => void;
}

export default function EmptyState({
    variant,
    patientName,
    hasFilters,
    onPrimaryAction,
}: EmptyStateProps) {
    if (variant === 'no-patient') {
        return (
            <Card className="rounded-[5px]">
                <CardContent className="p-8 text-center space-y-4">
                    <User className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                        <h3 className="font-medium text-lg">Selecione um paciente</h3>
                        <p className="text-sm text-muted-foreground">
                            Selecione um paciente para listar programas
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[5px]">
            <CardContent className="p-8 text-center space-y-4">
                <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                    <h3 className="font-medium text-lg">Nenhum programa encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                        {hasFilters
                            ? 'Tente ajustar os filtros de busca'
                            : `Nenhum programa para ${patientName}`}
                    </p>
                </div>
                {onPrimaryAction && <Button onClick={onPrimaryAction}>Criar Programa</Button>}
            </CardContent>
        </Card>
    );
}
