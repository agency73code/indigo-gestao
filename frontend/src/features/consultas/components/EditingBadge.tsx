import { Edit2 } from 'lucide-react';

export function EditingBadge() {
    return (
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-muted/50 border border-border rounded-md">
            <Edit2 
                className="h-4 w-4 text-muted-foreground" 
                strokeWidth={2}
                style={{
                    animation: 'pencilWrite 1.5s ease-in-out infinite'
                }}
            />
            <span className="text-sm font-medium text-muted-foreground">Editando...</span>
            
            <style>{`
                @keyframes pencilWrite {
                    0%, 100% { transform: translate(0, 0) rotate(-3deg); }
                    50% { transform: translate(2px, 2px) rotate(3deg); }
                }
            `}</style>
        </div>
    );
}
