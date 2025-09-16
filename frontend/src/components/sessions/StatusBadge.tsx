import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SessionStatus } from '@/lib/types/sessions';

const STATUS_MAP: Record<SessionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }>
    = {
        scheduled: {
            label: 'Agendado',
            variant: 'outline',
            className: 'border-primary text-primary',
        },
        in_progress: {
            label: 'Em andamento',
            variant: 'default',
            className: 'bg-primary text-primary-foreground',
        },
        completed: {
            label: 'Concluído',
            variant: 'secondary',
        },
        cancelled: {
            label: 'Cancelado',
            variant: 'destructive',
        },
        pending: {
            label: 'Pendente',
            variant: 'secondary',
        },
    };

interface StatusBadgeProps {
    status: SessionStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = STATUS_MAP[status];

    return (
        <Badge
            variant={config.variant}
            className={cn('rounded-[999px] px-3 py-1 text-xs font-medium', config.className, className)}
        >
            {config.label}
        </Badge>
    );
}

export function getStatusLabel(status: SessionStatus) {
    return STATUS_MAP[status]?.label ?? status;
}
