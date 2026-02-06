/**
 * HubFaturamentoPage
 * 
 * Página de redirecionamento de Faturamento - baseado no perfil do usuário.
 * - Gerente (manage all): acessa direto Gestão de Horas
 * - Terapeuta (qualquer tipo): acessa direto Minhas Horas
 * 
 * Usa o sistema de abilities igual aos programas.
 */

import { useNavigate } from 'react-router-dom';
import { useAbility } from '@/features/auth/abilities/useAbility';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function HubFaturamentoPage() {
    const navigate = useNavigate();
    const ability = useAbility();

    useEffect(() => {
        // Gerente (manage all) acessa direto Gestão de Horas
        if (ability.can('manage', 'all')) {
            navigate('/app/faturamento/gestao', { replace: true });
        } else {
            // Terapeuta (qualquer tipo) acessa direto Minhas Horas
            navigate('/app/faturamento/minhas-horas', { replace: true });
        }
    }, [ability, navigate]);

    // Tela de loading enquanto redireciona
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
}

export default HubFaturamentoPage;
