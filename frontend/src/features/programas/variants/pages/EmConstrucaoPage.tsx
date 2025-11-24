import { useEffect } from 'react';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import emConstrucaoSvg from '@/assets/images/auth/Em-construcao.svg';

interface EmConstrucaoPageProps {
    areaName: string;
    pageTitle?: string;
}

/**
 * Página genérica "Em Construção" para áreas em desenvolvimento
 */
export default function EmConstrucaoPage({ areaName, pageTitle }: EmConstrucaoPageProps) {
    const { setPageTitle: setTitle } = usePageTitle();
    const navigate = useNavigate();

    useEffect(() => {
        setTitle(pageTitle || `${areaName} - Em Desenvolvimento`);
    }, [setTitle, areaName, pageTitle]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
            <div className="max-w-lg w-full space-y-8 text-center">
                {/* Ilustração */}
                <div className="flex justify-center">
                    <img 
                        src={emConstrucaoSvg} 
                        alt="Página em construção" 
                        className="w-64 h-64 object-contain"
                    />
                </div>

                {/* Conteúdo */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-medium text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>
                        Página em Desenvolvimento
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        A funcionalidade de <strong>{areaName}</strong> está em desenvolvimento.
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Esta página será implementada em breve seguindo o padrão base + variante estabelecido.
                    </p>
                </div>

                {/* Botão */}
                <Button
                    onClick={() => navigate('/app')}
                    className="h-11 rounded-full px-8"
                    size="lg"
                >
                    Voltar ao Dashboard
                </Button>
            </div>
        </div>
    );
}
