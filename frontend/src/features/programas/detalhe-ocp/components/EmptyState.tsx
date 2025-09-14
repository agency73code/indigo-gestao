import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
}

export default function EmptyState({
    title = 'Nenhum dado encontrado',
    description = 'Ainda não há informações para exibir aqui.',
    actionLabel,
    onAction,
    icon,
}: EmptyStateProps) {
    const defaultIcon = icon || <FileText className="h-12 w-12 text-muted-foreground/50" />;

    return (
        <Card className="rounded-[5px]">
            <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    {defaultIcon}

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-muted-foreground">{title}</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
                    </div>

                    {actionLabel && onAction && (
                        <Button onClick={onAction} variant="outline" className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            {actionLabel}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
