import { useEffect } from 'react';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * Página temporária - Detalhe de Sessão TO
 * TODO: Implementar usando BaseDetalheSessaoPage quando estiver pronta
 */
export default function DetalheSessaoToPage() {
    const { setPageTitle } = usePageTitle();
    const navigate = useNavigate();

    useEffect(() => {
        setPageTitle('Detalhe da Sessão - TO');
    }, [setPageTitle]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <div className="max-w-md w-full space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="rounded-full bg-amber-100 p-4">
                        <AlertCircle className="h-12 w-12 text-amber-600" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Página em Desenvolvimento</h1>
                    <p className="text-muted-foreground">
                        A funcionalidade de visualização de detalhes de sessão de TO está em desenvolvimento.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Esta página será implementada seguindo o padrão base + variante estabelecido.
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/app/programas/terapia-ocupacional/sessoes')}
                    className="w-full"
                >
                    Voltar à Lista de Sessões
                </Button>
            </div>
        </div>
    );
}
