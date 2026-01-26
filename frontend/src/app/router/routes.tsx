import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { LoginPage, ForgotPasswordPage } from '../../features/auth';
import ForgotPasswordEmailSend from '../../features/auth/components/forgot-password-email-sent';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';
import ResetSuccessPage from '../../features/auth/components/reset-success';
import { RequireAbility } from '../../features/auth/components/RequireAbility';
import AuthProviderLayout from '../../features/shell/layouts/AuthProviderLayout';
import AppLayout from '../../features/shell/layouts/AppLayout';
import NotFoundPage from '../../features/shell/pages/NotFoundPage';
import TokenNotFoundPage from '../../shared/components/pages/TokenNotFoundPage';
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
import { FaturamentoHubPage, MinhasHorasPage, GestaoHorasPage, RegistrarLancamentoPage, DetalheLancamentoPage } from '../../features/faturamento';
import { AnamnesePage } from '../../features/anamnese/Cadastro';
import { AnamneseListPage } from '../../features/anamnese/Tabela';
import { AtasHubPage, NovaAtaPage, VisualizarAtaPage } from '../../features/atas-reuniao';
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

// Lazy imports para as páginas de área
const AreaHubTOPage = lazy(
    () => import('@/features/programas/variants/terapia-ocupacional/pages/AreaHubTOPage'),
);
const ToCadastroProgramaPage = lazy(
    () => import('@/features/programas/variants/terapia-ocupacional/pages/ToCadastroProgramaPage'),
);
const ToConsultaProgramasPage = lazy(
    () => import('@/features/programas/variants/terapia-ocupacional/pages/ToConsultaProgramasPage'),
);
const ToDetalheProgramaPage = lazy(
    () => import('@/features/programas/variants/terapia-ocupacional/pages/ToDetalheProgramaPage'),
);
const ToEditarProgramaPage = lazy(
    () => import('@/features/programas/variants/terapia-ocupacional/pages/ToEditarProgramaPage'),
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

// Lazy imports para Fisioterapia
const AreaHubFisioPage = lazy(
    () => import('@/features/programas/variants/fisioterapia/pages/AreaHubFisioPage'),
);
const FisioCadastroProgramaPage = lazy(
    () => import('@/features/programas/variants/fisioterapia/pages/FisioCadastroProgramaPage'),
);
const FisioConsultaProgramasPage = lazy(
    () => import('@/features/programas/variants/fisioterapia/pages/FisioConsultaProgramasPage'),
);
const FisioDetalheProgramaPage = lazy(
    () => import('@/features/programas/variants/fisioterapia/pages/FisioDetalheProgramaPage'),
);
const FisioEditarProgramaPage = lazy(
    () => import('@/features/programas/variants/fisioterapia/pages/FisioEditarProgramaPage'),
);
const RegistrarSessaoFisioPage = lazy(
    () => import('@/features/programas/variants/fisioterapia/pages/RegistrarSessaoFisioPage'),
);
const ConsultarSessoesFisioPage = lazy(
    () => import('@/features/programas/variants/fisioterapia/pages/ConsultarSessoesFisioPage'),
);
const DetalheSessaoFisioPage = lazy(
    () => import('@/features/programas/variants/fisioterapia/pages/DetalheSessaoFisioPage'),
);

const AreaHubMovimentoPage = lazy(
    () => import('@/features/programas/variants/movimento/pages/AreaHubMovimentoPage'),
);
const AreaHubMusiPage = lazy(
    () => import('@/features/programas/variants/musicoterapia/pages/AreaHubMusiPage'),
);
const MusiCadastroProgramaPage = lazy(
    () => import('@/features/programas/variants/musicoterapia/pages/MusiCadastroProgramaPage'),
);
const MusiConsultaProgramasPage = lazy(
    () => import('@/features/programas/variants/musicoterapia/pages/MusiConsultaProgramasPage'),
);
const MusiDetalheProgramaPage = lazy(
    () => import('@/features/programas/variants/musicoterapia/pages/MusiDetalheProgramaPage'),
);
const MusiEditarProgramaPage = lazy(
    () => import('@/features/programas/variants/musicoterapia/pages/MusiEditarProgramaPage'),
);
const RegistrarSessaoMusiPage = lazy(
    () => import('@/features/programas/variants/musicoterapia/pages/RegistrarSessaoMusiPage'),
);
const ConsultarSessoesMusiPage = lazy(
    () => import('@/features/programas/variants/musicoterapia/pages/ConsultarSessoesMusiPage'),
);
const DetalheSessaoMusiPage = lazy(
    () => import('@/features/programas/variants/musicoterapia/pages/DetalheSessaoMusiPage'),
);

// Fono
const DetalheSessaoFonoPage = lazy(
    () => import('@/features/programas/variants/fono/pages/DetalheSessaoFonoPage'),
);

// Psicoterapia - Prontuário Psicológico
const PsicoterapiaPage = lazy(
    () => import('@/features/programas/variants/psicoterapia/pages/PsicoterapiaPage'),
);
const CadastrarProntuarioPage = lazy(
    () => import('@/features/programas/variants/psicoterapia/pages/CadastrarProntuarioPage'),
);
const ConsultarProntuariosPage = lazy(
    () => import('@/features/programas/variants/psicoterapia/pages/ConsultarProntuariosPage'),
);
const DetalheProntuarioPage = lazy(
    () => import('@/features/programas/variants/psicoterapia/pages/DetalheProntuarioPage'),
);

// Outras áreas
const TerapiaAbaPage = lazy(
    () => import('@/features/programas/variants/terapia-aba/pages/TerapiaAbaPage'),
);
const PsicomotricidadePage = lazy(
    () => import('@/features/programas/variants/psicomotricidade/pages/PsicomotricidadePage'),
);
const EducacaoFisicaPage = lazy(
    () => import('@/features/programas/variants/educacao-fisica/pages/EducacaoFisicaPage'),
);
const NeuropsicologiaPage = lazy(
    () => import('@/features/programas/variants/neuropsicologia/pages/NeuropsicologiaPage'),
);
const PsicopedagogiaPage = lazy(
    () => import('@/features/programas/variants/psicopedagogia/pages/PsicopedagogiaPage'),
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
                                element: <Navigate to="/app/consultar/pacientes" replace />,
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
                                    <RequireAbility action="create" subject="Cadastro">
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
                            // ========== ROTAS DE ANAMNESE ==========
                            {
                                path: 'anamnese/lista',
                                element: (
                                    <RequireAbility action="read" subject="Consultar">
                                        <Suspense fallback={suspenseFallback}>
                                            <AnamneseListPage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            {
                                path: 'anamnese/cadastro',
                                element: (
                                    <RequireAbility action="create" subject="Cadastro">
                                        <Suspense fallback={suspenseFallback}>
                                            <AnamnesePage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            // Rota legada para compatibilidade (redireciona para lista)
                            {
                                path: 'anamnese',
                                element: (
                                    <RequireAbility action="read" subject="Consultar">
                                        <Suspense fallback={suspenseFallback}>
                                            <AnamneseListPage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            // ========== ROTAS DE ATAS DE REUNIÃO ==========
                            {
                                path: 'atas',
                                element: (
                                    <RequireAbility action="read" subject="Consultar">
                                        <Suspense fallback={suspenseFallback}>
                                            <AtasHubPage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            {
                                path: 'atas/nova',
                                element: (
                                    <RequireAbility action="create" subject="Cadastro">
                                        <Suspense fallback={suspenseFallback}>
                                            <NovaAtaPage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            {
                                path: 'atas/:id',
                                element: (
                                    <RequireAbility action="read" subject="Consultar">
                                        <Suspense fallback={suspenseFallback}>
                                            <VisualizarAtaPage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            {
                                path: 'atas/:id/editar',
                                element: (
                                    <RequireAbility action="update" subject="Consultar">
                                        <Suspense fallback={suspenseFallback}>
                                            <NovaAtaPage />
                                        </Suspense>
                                    </RequireAbility>
                                ),
                            },
                            // ========================================
                            {
                                path: 'cadastros/vinculos',
                                element: (
                                    <RequireAbility action="read" subject="Consultar">
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
                                element: <Navigate to="/app/programas/fonoaudiologia" replace />,
                            },
                            {
                                path: 'programas/fonoaudiologia',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <HubPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Fonoaudiologia', title: 'Fonoaudiologia' },
                            },
                            {
                                path: 'programas/psicopedagogia',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <PsicopedagogiaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Psicopedagogia', title: 'Psicopedagogia' },
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
                                path: 'programas/terapia-ocupacional/ocp/novo',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ToCadastroProgramaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Novo Programa', title: 'Novo Programa - TO' },
                            },
                            {
                                path: 'programas/terapia-ocupacional/ocp/:programaId/editar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ToEditarProgramaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Editar Programa', title: 'Editar Programa - TO' },
                            },
                            {
                                path: 'programas/terapia-ocupacional/consultar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ToConsultaProgramasPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Consultar Programas', title: 'Consultar Programas - TO' },
                            },
                            {
                                path: 'programas/terapia-ocupacional/programa/:programaId',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ToDetalheProgramaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Detalhe do Programa', title: 'Programa - TO' },
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
                                handle: { breadcrumb: 'Sessões TO', title: 'Sessões - TO' },
                            },
                            {
                                path: 'programas/terapia-ocupacional/sessoes/consultar',
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
                            // Fisioterapia
                            {
                                path: 'programas/fisioterapia',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <AreaHubFisioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Fisioterapia', title: 'Fisioterapia' },
                            },
                            {
                                path: 'programas/fisioterapia/ocp/novo',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <FisioCadastroProgramaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Novo Programa', title: 'Novo Programa - Fisio' },
                            },
                            {
                                path: 'programas/fisioterapia/ocp/:programaId/editar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <FisioEditarProgramaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Editar Programa', title: 'Editar Programa - Fisio' },
                            },
                            {
                                path: 'programas/fisioterapia/consultar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <FisioConsultaProgramasPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Consultar Programas', title: 'Consultar Programas - Fisio' },
                            },
                            {
                                path: 'programas/fisioterapia/programa/:programaId',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <FisioDetalheProgramaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Detalhe do Programa', title: 'Programa - Fisio' },
                            },
                            {
                                path: 'programas/fisioterapia/sessoes/registrar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <RegistrarSessaoFisioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Registrar Sessão', title: 'Registrar Sessão - Fisio' },
                            },
                            {
                                path: 'programas/fisioterapia/sessoes',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultarSessoesFisioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Sessões Fisio', title: 'Sessões - Fisio' },
                            },
                            {
                                path: 'programas/fisioterapia/sessoes/consultar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultarSessoesFisioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Consultar Sessões', title: 'Consultar Sessões - Fisio' },
                            },
                            {
                                path: 'programas/fisioterapia/sessoes/:sessaoId',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <DetalheSessaoFisioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Detalhe da Sessão', title: 'Detalhe da Sessão - Fisio' },
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
                                path: 'programas/musicoterapia/ocp/novo',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <MusiCadastroProgramaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Novo Programa', title: 'Novo Programa - Musicoterapia' },
                            },
                            {
                                path: 'programas/musicoterapia/ocp/:programaId/editar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <MusiEditarProgramaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Editar Programa', title: 'Editar Programa - Musicoterapia' },
                            },
                            {
                                path: 'programas/musicoterapia/consultar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <MusiConsultaProgramasPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Consultar Programas', title: 'Consultar Programas - Musicoterapia' },
                            },
                            {
                                path: 'programas/musicoterapia/programa/:programaId',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <MusiDetalheProgramaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Detalhe do Programa', title: 'Programa - Musicoterapia' },
                            },
                            {
                                path: 'programas/musicoterapia/sessoes/registrar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <RegistrarSessaoMusiPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Registrar Sessão', title: 'Registrar Sessão - Musicoterapia' },
                            },
                            {
                                path: 'programas/musicoterapia/sessoes',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultarSessoesMusiPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Sessões', title: 'Sessões - Musicoterapia' },
                            },
                            {
                                path: 'programas/musicoterapia/sessoes/consultar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultarSessoesMusiPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Consultar Sessões', title: 'Consultar Sessões - Musicoterapia' },
                            },
                            {
                                path: 'programas/musicoterapia/sessoes/:sessaoId',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <DetalheSessaoMusiPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Detalhe da Sessão', title: 'Detalhe da Sessão - Musicoterapia' },
                            },
                            // ===== Psicoterapia - Prontuário Psicológico =====
                            {
                                path: 'programas/psicoterapia',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <PsicoterapiaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Psicoterapia', title: 'Psicoterapia' },
                            },
                            {
                                path: 'programas/psicoterapia/cadastrar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <CadastrarProntuarioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Novo Prontuário', title: 'Novo Prontuário Psicológico' },
                            },
                            {
                                path: 'programas/psicoterapia/consultar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultarProntuariosPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Consultar Prontuários', title: 'Consultar Prontuários' },
                            },
                            {
                                path: 'programas/psicoterapia/prontuario/:prontuarioId',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <DetalheProntuarioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Detalhe do Prontuário', title: 'Prontuário Psicológico' },
                            },
                            {
                                path: 'programas/psicoterapia/editar/:prontuarioId',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <CadastrarProntuarioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Editar Prontuário', title: 'Editar Prontuário' },
                            },
                            // ===== Outras Áreas =====
                            {
                                path: 'programas/terapia-aba',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <TerapiaAbaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Terapia ABA', title: 'Terapia ABA' },
                            },
                            {
                                path: 'programas/psicomotricidade',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <PsicomotricidadePage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Psicomotricidade', title: 'Psicomotricidade' },
                            },
                            {
                                path: 'programas/educacao-fisica',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <EducacaoFisicaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Educação Física', title: 'Educação Física' },
                            },
                            {
                                path: 'programas/neuropsicologia',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <NeuropsicologiaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Neuropsicologia', title: 'Neuropsicologia' },
                            },
                            {
                                path: 'programas/lista',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultaOcpPage />
                                    </Suspense>
                                ),
                            },
                            // Rotas base para modelo Fisio (compartilhadas por Fisio, Psicomotricidade, Educação Física)
                            // Não contêm "fisioterapia" na URL para não mudar o contexto de área
                            {
                                path: 'programas/novo-fisio',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <FisioCadastroProgramaPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Novo Programa' },
                            },
                            {
                                path: 'programas/lista-fisio',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <FisioConsultaProgramasPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Consultar Programas' },
                            },
                            {
                                path: 'programas/sessoes-fisio/consultar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <ConsultarSessoesFisioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Consultar Sessões' },
                            },
                            {
                                path: 'programas/sessoes-fisio/registrar',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <RegistrarSessaoFisioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Registrar Sessão' },
                            },
                            {
                                path: 'programas/sessoes-fisio/:sessaoId',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <DetalheSessaoFisioPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Detalhe da Sessão' },
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
                                        <DetalheSessaoFonoPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Detalhe da Sessão' },
                            },
                            {
                                path: 'faturamento',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <FaturamentoHubPage />
                                    </Suspense>
                                ),
                                handle: { breadcrumb: 'Faturamento', title: 'Faturamento' },
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
                                path: 'faturamento/lancamentos/:id',
                                element: (
                                    <Suspense fallback={suspenseFallback}>
                                        <DetalheLancamentoPage />
                                    </Suspense>
                                ),
                                handle: {
                                    breadcrumb: 'Detalhes do Lançamento',
                                    title: 'Detalhes do Lançamento',
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
