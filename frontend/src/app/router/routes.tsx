import { createBrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import AppLayout from '../../features/shell/layouts/AppLayout';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import CadastrosPage from '../../features/cadastros/pages/CadastrosPage';
import ConsultasPage from '../../features/consultas/pages/ConsultasPage';
import ArquivosPage from '../../features/arquivos/pages/ArquivosPage';
import ConfiguracoesPage from '../../features/configuracoes/pages/ConfiguracoesPage';
import CadastroTerapeutaPage from '../../features/cadastros/pages/CadastroTerapeutaPage';
import CadastroClientePage from '../../features/cadastros/pages/CadastroClientePage';
import CadastratoPacientePage from '../../features/cadastros/pages/CadastratoPacientePage';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </div>
);

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

export const router = createBrowserRouter([
    {
        path: '/app',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: (
                    <SuspenseWrapper>
                        <DashboardPage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: 'cadastros',
                element: (
                    <SuspenseWrapper>
                        <CadastrosPage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: 'cadastro/terapeuta',
                element: (
                    <SuspenseWrapper>
                        <CadastroTerapeutaPage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: 'cadastro/cliente',
                element: (
                    <SuspenseWrapper>
                        <CadastroClientePage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: 'cadastro/paciente',
                element: (
                    <SuspenseWrapper>
                        <CadastratoPacientePage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: 'consultas',
                element: (
                    <SuspenseWrapper>
                        <ConsultasPage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: 'arquivos',
                element: (
                    <SuspenseWrapper>
                        <ArquivosPage />
                    </SuspenseWrapper>
                ),
            },
            {
                path: 'configuracoes',
                element: (
                    <SuspenseWrapper>
                        <ConfiguracoesPage />
                    </SuspenseWrapper>
                ),
            },
        ],
    },
]);
