/* eslint-disable react-refresh/only-export-components */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials, ForgotPasswordData, User, AuthState } from '../types/auth.types';
import { signIn, forgotPassword as forgotPasswordApi, getMe, apiLogout } from '@/lib/api';
import { AuthContext, type AuthContextValue } from './AuthContext';

const AUTH_BYPASS = import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    });

    const hydrate = useCallback(async () => {
        if (AUTH_BYPASS) {
            setAuthState({
                user: {
                    id: 'dev-uid',
                    email: 'dev-uid@dev.com',
                    name: 'dev-uid',
                    perfil_acesso: 'gerente',
                },
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return;
        }

        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const me = await getMe();
            if (!me) {
                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
                return;
            }
            setAuthState({
                user: {
                    id: String(me.user.id),
                    email: me.user.email ?? '',
                    name: me.user.name ?? '',
                    perfil_acesso: me.user.perfil_acesso,
                },
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch {
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    }, []);

    const login = useCallback(
        async (credentials: LoginCredentials) => {
            setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
            try {
                const resp = await signIn(credentials.email, credentials.password);
                setAuthState({
                    user: (resp.user as User) ?? null,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
                navigate('app');
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Erro ao fazer login';
                setAuthState((prev) => ({ ...prev, isLoading: false, error: msg }));
            }
        },
        [navigate],
    );

    const forgotPassword = useCallback(
        async ({ email }: ForgotPasswordData) => {
            setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
            try {
                await forgotPasswordApi(email);
                navigate('/forgot-password/email-sent');
            } catch {
                navigate('/forgot-password/email-sent');
            } finally {
                setAuthState((prev) => ({ ...prev, isLoading: false }));
            }
        },
        [navigate],
    );

    const logout = useCallback(async () => {
        try {
            await apiLogout();
        } finally {
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
            navigate('/login');
        }
    }, [navigate]);

    const didHydrateRef = useRef(false);
    useEffect(() => {
        if (didHydrateRef.current) return;
        didHydrateRef.current = true;
        void hydrate();
    }, [hydrate]);

    const value: AuthContextValue = {
        ...authState,
        login,
        forgotPassword,
        logout,
        hydrate,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
