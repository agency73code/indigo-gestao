import { createBrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import AppLayout from '../../features/shell/layouts/AppLayout';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import ConsultaPage from '../../features/consultas/pages/ConsultasPage';
import TerapeutasListPage from '../../features/consultas/pages/TerapeutasListPage';
import PacientesListPage from '../../features/consultas/pages/PacientesListPage';
import ArquivosPage from '../../features/arquivos/pages/ArquivosPage';
import ConfiguracoesPage from '../../features/configuracoes/pages/ConfiguracoesPage';
import CadastroHubPage from '../../features/cadastros/pages/CadastroHubPage';
import CadastroTerapeutaPage from '../../features/cadastros/pages/CadastroTerapeutaPage';
import CadastroClientePage from '../../features/cadastros/pages/CadastroClientePage';
import HubPage from '../../features/programas/pages/HubPage';
import ListarProgramasPage from '../../features/programas/pages/ListarProgramasPage';
import CriarProgramaPage from '../../features/programas/pages/CriarProgramaPage';
import DetalheProgramaPage from '../../features/programas/pages/DetalheProgramaPage';
import EditarProgramaPage from '../../features/programas/pages/EditarProgramaPage';
import RegistrarSessaoPage from '../../features/programas/pages/RegistrarSessaoPage';
import RelatorioMensalPage from '../../features/programas/pages/RelatorioMensalPage';
import SessaoPage from '../../features/programas/pages/SessaoPage';

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
                path: 'cadastros',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <CadastroHubPage />
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
                        <ConsultaPage />
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
            {
                path: 'programas',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <HubPage />
                    </Suspense>
                ),
            },
            {
                path: 'programas/lista',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <ListarProgramasPage />
                    </Suspense>
                ),
            },
            {
                path: 'programas/novo',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <CriarProgramaPage />
                    </Suspense>
                ),
            },
            {
                path: 'programas/:programaId',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <DetalheProgramaPage />
                    </Suspense>
                ),
            },
            {
                path: 'programas/:programaId/editar',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <EditarProgramaPage />
                    </Suspense>
                ),
            },
            {
                path: 'programas/sessoes/nova',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <RegistrarSessaoPage />
                    </Suspense>
                ),
            },
            {
                path: 'programas/relatorios/mensal',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <RelatorioMensalPage />
                    </Suspense>
                ),
            },
            {
                path: 'programas/sessoes/:sessaoId',
                element: (
                    <Suspense fallback={suspenseFallback}>
                        <SessaoPage />
                    </Suspense>
                ),
            },
        ],
    },
]);
