import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CloseButtonProps {
    onClick?: () => void;
    className?: string;
}

/**
 * Botão circular de fechar com X que se transforma em seta
 * - X se transforma em seta diagonal (45°) no hover
 * - Animação suave e profissional
 */
export function CloseButton({ onClick, className = '' }: CloseButtonProps) {
    return (
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClick} 
            className={`group h-10 w-10 p-0 rounded-full hover:bg-accent transition-all bg-header-bg relative ${className}`}
            aria-label="Fechar"
            title="Fechar"
        >
            <X className="h-5 w-5 transition-all duration-300 ease-out group-hover:scale-0 group-hover:rotate-90" />
            <ArrowLeft className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 rotate-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:rotate-45" />
        </Button>
    );
}
