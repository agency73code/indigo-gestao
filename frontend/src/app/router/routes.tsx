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
import HubPage from '../../features/programas/pages/HubPage';
import ConsultaOcpPage from '../../features/programas/pages/ConsultaOcpPage';
import CadastroOcpPage from '../../features/programas/pages/CadastroOcpPage';
import DetalheProgramaPage from '../../features/programas/pages/DetalheProgramaPage';
import EditarProgramaPage from '../../features/programas/pages/EditarProgramaPage';
import { CadastroSessaoPage } from '../../features/programas/nova-sessao';
import RelatorioMensalPage from '../../features/programas/pages/RelatorioMensalPage';
import { HubFaturamentoPage } from '../../features/faturamento';
import RegistrarLancamentoPage from '../../features/faturamento/registrar-lancamento/pages/RegistrarLancamentoPage';
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
                                        <RequireAbility action="manage" subject="Cadastro">
                                            <CadastroHubPage />
                                        </RequireAbility>
                                    </Suspense>
                                ),
                            },
                            {
                                path: 'cadastro/terapeuta',
                                element: (
                                    <RequireAbility action="manage" subject="Cadastro">
                                        <Suspense fallback={suspenseFallback}>
                                            <CadastroTerapeutaPage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            {
                                path: 'cadastro/cliente',
                                element: (
                                    <RequireAbility action="manage" subject="Cadastro">
                                        <Suspense fallback={suspenseFallback}>
                                            <CadastroClientePage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            {
                                path: 'cadastros/vinculos',
                                element: (
                                    <RequireAbility action="manage" subject="Cadastro">
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
                                        <HubPage />
                                    </Suspense>
                                ),
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
                                path: 'faturamento/novo',
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
