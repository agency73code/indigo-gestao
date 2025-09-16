import { AlertCircle } from 'lucide-react';

interface ValidationHintProps {
    message: string;
}

export default function ValidationHint({ message }: ValidationHintProps) {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}
