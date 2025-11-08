import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { LoginPage, ForgotPasswordPage } from '../../features/auth';
import ForgotPasswordEmailSend from '../../features/auth/components/forgot-password-email-sent';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';
import ResetSuccessPage from '../../features/auth/components/reset-success';
import { RequireAbility } from '../../features/auth/components/RequireAbility';
import AuthProviderLayout from '../../features/shell/layouts/AuthProviderLayout';
import AppLayout from '../../features/shell/layouts/AppLayout';
import NotFoundPage from '../../features/shell/pages/NotFoundPage';
import TokenNotFoundPage from '../../shared/components/pages/TokenNotFoundPage';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import TerapeutasListPage from '../../features/consultas/pages/TerapeutasListPage';
import PacientesListPage from '../../features/consultas/pages/PacientesListPage';
import ArquivosPage from '../../features/arquivos/pages/ArquivosPage';
import ConfiguracoesPage from '../../features/configuracoes/pages/ConfiguracoesPage';
import CadastroHubPage from '../../features/cadastros/pages/CadastroHubPage';
import CadastroTerapeutaPage from '../../features/cadastros/pages/CadastroTerapeutaPage';
import CadastroClientePage from '../../features/cadastros/pages/CadastroClientePage';
import { VinculosPage } from '../../features/cadastros/links';
import ConsultaHubPage from '../../features/consultas/pages/ConsultaHubPage';
import TestDocumentsPage from '../../features/consultas/pages/TestDocumentsPage';
import HubPage from '../../features/programas/pages/HubPage';
import HubProgramasPage from '../../features/programas/pages/HubProgramasPage';
import { RelatoriosHubPage, RelatoriosPage, GerarRelatorioPage, VisualizarRelatorioPage } from '../../features/relatorios';
import ConsultaOcpPage from '../../features/programas/pages/ConsultaOcpPage';
import CadastroOcpPage from '../../features/programas/pages/CadastroOcpPage';
import DetalheProgramaPage from '../../features/programas/pages/DetalheProgramaPage';
import EditarProgramaPage from '../../features/programas/pages/EditarProgramaPage';
import { CadastroSessaoPage } from '../../features/programas/nova-sessao';
import { HubFaturamentoPage } from '../../features/faturamento';
import RegistrarLancamentoPage from '../../features/faturamento/registrar-lancamento/pages/RegistrarLancamentoPage';
import MinhasHorasPage from '../../features/faturamento/minhas-horas/pages/MinhasHorasPage';
import GestaoHorasPage from '../../features/faturamento/gestao/pages/GestaoHorasPage';
import NotAccessPage from '@/features/shell/pages/NotAccessPage';
import NotPermissionPage from '@/features/shell/pages/NotPermissionPage';
import RequireAuth from '@/features/auth/components/RequireAuth';

const suspenseFallback = (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
);

const ConsultarSessaoPage = lazy(
    () => import('@/features/programas/sessoes/pages/ConsultarSessao'),
);
const DetalheSessaoPage = lazy(() => import('@/features/programas/sessoes/pages/DetalheSessao'));

// Lazy imports para as páginas de área
const AreaHubTOPage = lazy(
    () => import('@/features/programas/variants/terapia-ocupacional/pages/AreaHubTOPage'),
);
const RegistrarSessaoToPage = lazy(
    () => import('@/features/programas/variants/terapia-ocupacional/pages/RegistrarSessaoToPage'),
);
const ConsultarSessoesToPage = lazy(
    () => import('@/features/programas/variants/terapia-ocupacional/pages/ConsultarSessoesToPage'),
);
const DetalheSessaoToPage = lazy(
    () => import('@/features/programas/variants/terapia-ocupacional/pages/DetalheSessaoToPage'),
);
const AreaHubMovimentoPage = lazy(
    () => import('@/features/programas/variants/movimento/pages/AreaHubMovimentoPage'),
);
const AreaHubMusiPage = lazy(
    () => import('@/features/programas/variants/musicoterapia/pages/AreaHubMusiPage'),
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AuthProviderLayout />,
        children: [
            { index: true, element: <LoginPage /> },
            { path: 'sign-in', element: <LoginPage /> },
            { path: 'login', element: <LoginPage /> },
            { path: 'forgot-password', element: <ForgotPasswordPage /> },
            { path: 'forgot-password/email-sent', element: <ForgotPasswordEmailSend /> },
            { path: 'reset-password', element: <ResetPasswordPage /> },
            { path: 'reset-success', element: <ResetSuccessPage /> },
            {
                path: 'app',
                element: <RequireAuth />,
                children: [
                    {
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
                                        <RequireAbility action="create" subject="Cadastro">
                                            <CadastroHubPage />
                                        </RequireAbility>
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'cadastro/terapeuta',
                                element: (
                                    <RequireAbility action="manage" subject="all">
                                        <Suspense fallback={suspenseFallback}>
                                            <CadastroTerapeutaPage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            {
                                path: 'cadastro/cliente',
                                element: (
                                    <RequireAbility action="create" subject="Cadastro">
                                        <Suspense fallback={suspenseFallback}>
                                            <CadastroClientePage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            {
                                path: 'cadastros/vinculos',
                                element: (
                                    <RequireAbility action="create" subject="Cadastro">
                                        <Suspense fallback={suspenseFallback}>
                                            <VinculosPage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            {
                                path: 'consultar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultaHubPage />
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'consultar/terapeutas',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <TerapeutasListPage />
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'consultar/pacientes',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <PacientesListPage />
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'test-documents',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <TestDocumentsPage />
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
                                path: 'configuracoes/*',
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
                                        <HubProgramasPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Programas', title: 'Programas' },
                            },
                            {
                                path: 'programas/fono-psico',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <HubPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Fonoaudiologia & Psicopedagogia', title: 'Fono & Psico' },
                            },
                            {
                                path: 'programas/terapia-ocupacional',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <AreaHubTOPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Terapia Ocupacional', title: 'Terapia Ocupacional' },
                            },
                            {
                                path: 'programas/terapia-ocupacional/sessoes/registrar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <RegistrarSessaoToPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Registrar Sessão', title: 'Registrar Sessão - TO' },
                            },
                            {
                                path: 'programas/terapia-ocupacional/sessoes',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultarSessoesToPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Consultar Sessões', title: 'Consultar Sessões - TO' },
                            },
                            {
                                path: 'programas/terapia-ocupacional/sessoes/:sessaoId',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <DetalheSessaoToPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Detalhe da Sessão', title: 'Detalhe da Sessão - TO' },
                            },
                            {
                                path: 'programas/movimento',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <AreaHubMovimentoPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Sessão de Movimento', title: 'Movimento' },
                            },
                            {
                                path: 'programas/musicoterapia',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <AreaHubMusiPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Musicoterapia', title: 'Musicoterapia' },
                            },
                            {
                                path: 'programas/lista',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultaOcpPage />
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'programas/novo',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <CadastroOcpPage />
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
                                        <CadastroSessaoPage />
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'programas/sessoes/consultar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultarSessaoPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Consultar Sessão' },
                            },
                            {
                                path: 'relatorios',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <RelatoriosHubPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Relatórios', title: 'Relatórios' },
                            },
                            {
                                path: 'relatorios/lista',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <RelatoriosPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Relatórios Salvos', title: 'Relatórios Salvos' },
                            },
                            {
                                path: 'relatorios/novo',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <GerarRelatorioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Gerar Relatório', title: 'Gerar Relatório' },
                            },
                            {
                                path: 'relatorios/:id',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <VisualizarRelatorioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Visualizar Relatório', title: 'Visualizar Relatório' },
                            },
                            {
                                path: 'programas/sessoes/:sessaoId',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <DetalheSessaoPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Detalhe da Sessão' },
                            },
                            {
                                path: 'faturamento',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <HubFaturamentoPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Faturamento', title: 'Faturamento' },
                            },
                            {
                                path: 'faturamento/registrar-lancamento',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <RegistrarLancamentoPage />
                                    </Suspense>
                                ),
                                handle: {
                                    breadcrumb: 'Registrar Lançamento',
                                    title: 'Registrar Lançamento',
                                },
                            },
                            {
                                path: 'faturamento/minhas-horas',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <MinhasHorasPage />
                                    </Suspense>
                                ),
                                handle: {
                                    breadcrumb: 'Minhas Horas',
                                    title: 'Minhas Horas',
                                },
                            },
                            {
                                path: 'faturamento/gestao',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <GestaoHorasPage />
                                    </Suspense>
                                ),
                                handle: {
                                    breadcrumb: 'Gestão de Horas',
                                    title: 'Gestão de Horas',
                                },
                            },
                        ],
                    },
                ],
            },
            { path: '401', element: <NotAccessPage /> },
            { path: '403', element: <NotPermissionPage /> },
            { path: '404', element: <NotFoundPage /> },
            { path: 'token-not-found', element: <TokenNotFoundPage /> },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
]);
