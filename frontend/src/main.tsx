import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from './screens/auth/layout.tsx';
import SignInPage from './screens/auth/sign-in/page.tsx';
import SignUpPage from './screens/auth/sign-up/page.tsx';
import ForgotPasswordPage from './screens/auth/forgot-password/forgot-password.tsx';
import ResetPasswordPage from './screens/auth/reset-password/reset-password.tsx';
import ResetSuccessPage from './screens/auth/reset-success/reset-success.tsx';

import './global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <AuthLayout>
                            <SignInPage />
                        </AuthLayout>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <AuthLayout>
                            <SignUpPage />
                        </AuthLayout>
                    }
                />

                <Route
                    path="/forgot-password"
                    element={
                        <AuthLayout>
                            <ForgotPasswordPage />
                        </AuthLayout>
                    }
                />

                <Route
                    path="/reset-password"
                    element={
                        <AuthLayout>
                            <ResetPasswordPage />
                        </AuthLayout>
                    }
                />

                <Route
                    path="/reset-success"
                    element={
                        <AuthLayout>
                            <ResetSuccessPage />
                        </AuthLayout>
                    }
                />

                <Route
                    path="*"
                    element={
                        <AuthLayout>
                            <SignInPage />
                        </AuthLayout>
                    }
                />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
);
