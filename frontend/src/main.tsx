import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { LoginPage, ForgotPasswordPage } from './features/auth';
import PageTransition from './shared/components/layout/PageTransition';
import NotFoundPage from './features/shell/pages/NotFoundPage.tsx';
import TokenNotFoundPage from './shared/components/pages/TokenNotFoundPage';
import ForgotPasswordEmailSend from './features/auth/components/forgot-password-email-sent.tsx';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage.tsx';
import ResetSuccessPage from './features/auth/components/reset-success.tsx';
import AppLayout from './features/shell/layouts/AppLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import TerapeutasListPage from './features/consultas/pages/TerapeutasListPage';
import PacientesListPage from './features/consultas/pages/PacientesListPage';
import ArquivosPage from './features/arquivos/pages/ArquivosPage';
import ConfiguracoesPage from './features/configuracoes/pages/ConfiguracoesPage';
import CadastroTerapeutaPage from './features/cadastros/pages/CadastroTerapeutaPage';
import CadastroClientePage from './features/cadastros/pages/CadastroClientePage';
import CadastroHubPage from './features/cadastros/pages/CadastroHubPage';
import ConsultaHubPage from './features/consultas/pages/ConsultaHubPage';
import { AuthProvider } from './features/auth/context/AuthContext.tsx';

import './global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <PageTransition>
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/sign-in" element={<LoginPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route
                            path="/forgot-password/email-sent"
                            element={<ForgotPasswordEmailSend />}
                        />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/reset-success" element={<ResetSuccessPage />} />
                        <Route path="/app" element={<AppLayout />}>
                            <Route index element={<DashboardPage />} />
                            <Route path="cadastros" element={<CadastroHubPage />} />
                            <Route path="cadastro/terapeuta" element={<CadastroTerapeutaPage />} />
                            <Route path="cadastro/cliente" element={<CadastroClientePage />} />
                            <Route path="consultas" element={<ConsultaHubPage />} />
                            <Route path="consultas/terapeutas" element={<TerapeutasListPage />} />
                            <Route path="consultas/pacientes" element={<PacientesListPage />} />
                            <Route path="arquivos" element={<ArquivosPage />} />
                            <Route path="configuracoes" element={<ConfiguracoesPage />} />
                        </Route>
                        <Route path="/404" element={<NotFoundPage />} />
                        <Route path="/token-not-found" element={<TokenNotFoundPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </PageTransition>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
