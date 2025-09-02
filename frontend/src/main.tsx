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

import './global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <PageTransition>
                <Routes>
                    <Route path="/sign-in" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route
                        path="/forgot-password/email-sent"
                        element={<ForgotPasswordEmailSend />}
                    />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/reset-success" element={<ResetSuccessPage />} />
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="/token-not-found" element={<TokenNotFoundPage />} />
                    <Route path="/" element={<LoginPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </PageTransition>
        </BrowserRouter>
    </React.StrictMode>,
);
