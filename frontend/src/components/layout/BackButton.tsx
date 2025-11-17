import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    onClick?: () => void;
    className?: string;
}

/**
 * Botão circular de voltar com setinha
 * - Se onClick for fornecido, usa ele
 * - Senão, usa navigate(-1) do react-router
 */
export function BackButton({ onClick, className = '' }: BackButtonProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`group h-10 w-10 rounded-full bg-header-bg hover:bg-header-bg/80 flex items-center justify-center transition-all duration-300 cursor-pointer ${className}`}
            aria-label="Voltar"
            title="Voltar para a página anterior"
        >
            <ArrowLeft className="h-4 w-4 text-black dark:text-white transition-all duration-300 ease-out group-hover:rotate-45" />
        </button>
    );
}
