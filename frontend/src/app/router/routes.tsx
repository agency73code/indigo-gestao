import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../../features/shell/layouts/AppLayout';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import CadastrosPage from '../../features/cadastros/pages/CadastrosPage';
import ConsultasPage from '../../features/consultas/pages/ConsultasPage';
import ArquivosPage from '../../features/arquivos/pages/ArquivosPage';
import ConfiguracoesPage from '../../features/configuracoes/pages/ConfiguracoesPage';
import CadastroTerapeutaPage from '../../features/cadastros/pages/CadastroTerapeutaPage';
import CadastratoPacientePage from '../../features/cadastros/pages/CadastratoPacientePage';

export const router = createBrowserRouter([
    {
        path: '/app',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: 'cadastros',
                element: <CadastrosPage />,
            },
            {
                path: 'cadastro/terapeuta',
                element: <CadastroTerapeutaPage />,
            },
            {
                path: 'cadastro/paciente',
                element: <CadastratoPacientePage />,
            },
            {
                path: 'consultas',
                element: <ConsultasPage />,
            },
            {
                path: 'arquivos',
                element: <ArquivosPage />,
            },
            {
                path: 'configuracoes',
                element: <ConfiguracoesPage />,
            },
        ],
    },
]);
