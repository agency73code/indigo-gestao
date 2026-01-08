/**
 * Página Hub de Atas de Reunião
 * 
 * Layout profissional com:
 * - Cards de estatísticas
 * - Lista de atas com preview em painel lateral
 * - Filtros e busca
 */

import { useEffect } from 'react';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { AtaTable } from '../components/AtaTable';

export function AtasHubPage() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Atas de Reunião');
    }, [setPageTitle]);

    return (
        <div className="min-h-screen bg-background">
            <div className="px-2 lg:px-6 py-6">
                <AtaTable />
            </div>
        </div>
    );
}

export default AtasHubPage;
