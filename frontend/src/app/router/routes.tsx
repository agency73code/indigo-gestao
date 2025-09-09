import { createBrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import AppLayout from '../../features/shell/layouts/AppLayout';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import ConsultasPage from '../../features/consultas/pages/ConsultasPage';
import TerapeutasListPage from '../../features/consultas/pages/TerapeutasListPage';
import PacientesListPage from '../../features/consultas/pages/PacientesListPage';
import ArquivosPage from '../../features/arquivos/pages/ArquivosPage';
import ConfiguracoesPage from '../../features/configuracoes/pages/ConfiguracoesPage';
import CadastroTerapeutaPage from '../../features/cadastros/pages/CadastroTerapeutaPage';
import CadastroClientePage from '../../features/cadastros/pages/CadastroClientePage';

const suspenseFallback = (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
);

export const router = createBrowserRouter([
    {
        path: '/app',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <DashboardPage />
                    </Suspense>
                ),
            },

            {
                path: 'cadastro/terapeuta',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <CadastroTerapeutaPage />
                    </Suspense>
                ),
            },
            {
                path: 'cadastro/cliente',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <CadastroClientePage />
                    </Suspense>
                ),
            },
            {
                path: 'consultas',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <ConsultasPage />
                    </Suspense>
                ),
            },
            {
                path: 'consultas/terapeutas',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <TerapeutasListPage />
                    </Suspense>
                ),
            },
            {
                path: 'consultas/pacientes',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <PacientesListPage />
                    </Suspense>
                ),
            },
            {
                path: 'arquivos',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <ArquivosPage />
                    </Suspense>
                ),
            },
            {
                path: 'configuracoes',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <ConfiguracoesPage />
                    </Suspense>
                ),
            },
        ],
    },
]);
