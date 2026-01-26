/**
 * MinhasHorasPage
 * 
 * Página para o terapeuta visualizar e lançar suas horas.
 * Utiliza o LancamentosHub no modo terapeuta.
 */

import { useEffect } from 'react';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import LancamentosHub from '../components/LancamentosHub';

export function MinhasHorasPage() {
    const { setPageTitle, setNoMainContainer } = usePageTitle();

    useEffect(() => {
        setPageTitle('Minhas Horas');
        setNoMainContainer(true);

        return () => {
            setNoMainContainer(false);
        };
    }, [setPageTitle, setNoMainContainer]);

    return <LancamentosHub mode="terapeuta" title="Minhas Horas" />;
}

export default MinhasHorasPage;
