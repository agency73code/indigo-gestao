/**
 * MinhasHorasPage (Nova versão)
 * 
 * Página para o terapeuta visualizar seu faturamento.
 * Utiliza dados de sessões e atas cadastradas no sistema.
 * 
 * NOTA: Esta versão substitui a antiga que permitia lançamentos manuais.
 */

import { useEffect } from 'react';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import FaturamentoHub from '../components/FaturamentoHub';

export function MinhasHorasSessoesPage() {
    const { setPageTitle, setNoMainContainer } = usePageTitle();

    useEffect(() => {
        setPageTitle('Minhas Horas');
        setNoMainContainer(true);

        return () => {
            setNoMainContainer(false);
        };
    }, [setPageTitle, setNoMainContainer]);

    return <FaturamentoHub mode="terapeuta" title="Minhas Horas" />;
}

export default MinhasHorasSessoesPage;
