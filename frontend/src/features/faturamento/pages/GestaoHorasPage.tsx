/**
 * GestaoHorasPage
 * 
 * Página para o gerente visualizar e aprovar faturamento de horas.
 * Utiliza o FaturamentoGerenteHub com funcionalidades de:
 * - Ver pendentes de aprovação
 * - Aprovar em massa
 * - Visualizar por terapeuta
 * - Visualizar por cliente
 * 
 * NOTA: Os dados vêm de sessões e atas cadastradas no sistema.
 */

import { useEffect } from 'react';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { FaturamentoGerenteHub } from '../components/FaturamentoGerenteHub';

export function GestaoHorasPage() {
    const { setPageTitle, setNoMainContainer } = usePageTitle();

    useEffect(() => {
        setPageTitle('Gestão de Horas');
        setNoMainContainer(true);

        return () => {
            setNoMainContainer(false);
        };
    }, [setPageTitle, setNoMainContainer]);

    return <FaturamentoGerenteHub />;
}

export default GestaoHorasPage;
