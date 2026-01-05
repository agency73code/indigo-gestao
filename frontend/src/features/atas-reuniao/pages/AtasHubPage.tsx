/**
 * Página Hub de Atas de Reunião
 * 
 * Layout igual à página de Relatórios:
 * - Título dinâmico no header (via usePageTitle)
 * - Espaçamentos consistentes
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
            {/* Conteúdo principal */}
            <div className="px-1 lg:px-4 py-4 space-y-4">
                <AtaTable />
            </div>
        </div>
    );
}

export default AtasHubPage;
