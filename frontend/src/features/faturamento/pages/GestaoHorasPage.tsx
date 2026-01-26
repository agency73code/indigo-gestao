/**
 * GestaoHorasPage
 * 
 * Página para o gerente visualizar e aprovar lançamentos de horas.
 * Utiliza o LancamentosHub no modo gerente.
 */

import { useEffect } from 'react';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import LancamentosHub from '../components/LancamentosHub';

export function GestaoHorasPage() {
    const { setPageTitle, setNoMainContainer } = usePageTitle();

    useEffect(() => {
        setPageTitle('Gestão de Horas');
        setNoMainContainer(true);

        return () => {
            setNoMainContainer(false);
        };
    }, [setPageTitle, setNoMainContainer]);

    return <LancamentosHub mode="gerente" title="Gestão de Horas" />;
}

export default GestaoHorasPage;
