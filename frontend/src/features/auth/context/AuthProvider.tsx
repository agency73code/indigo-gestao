import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LoginCredentials, ForgotPasswordData, AuthState } from '../types/auth.types';
import { signIn, forgotPassword as forgotPasswordApi, getMe, apiLogout } from '@/lib/api';
import { AuthContext, type AuthContextValue } from './AuthContext';

const AUTH_BYPASS = import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true';
const PUBLIC_ROUTES = ['/login', '/forgot-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
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
                    avatar_url: null,
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
                setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null });
                return;
            }

            setAuthState({
                user: {
                    id: String(me.user.id),
                    email: me.user.email ?? '',
                    name: me.user.name ?? '',
                    perfil_acesso: me.user.perfil_acesso,
                    area_atuacao: me.user.area_atuacao,
                    avatar_url: me.user.avatar_url ?? null,
                },
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch {
            setAuthState({ user: null, isAuthenticated: false, isLoading: false, error: null, });
        }
    }, []);

    const login = useCallback(
        async (credentials: LoginCredentials) => {
            setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
            try {
                await signIn(credentials.email, credentials.password);
                await hydrate();
                navigate('/app/consultar/pacientes');
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Erro ao fazer login';
                setAuthState((prev) => ({ ...prev, isLoading: false, error: msg }));
            }
        },
        [hydrate, navigate],
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
            sessionStorage.setItem('auth:justLoggedOut', '1');
            await apiLogout();
        } finally {
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    // Versão do avatar - incrementa a cada atualização para forçar re-render
    const [avatarVersion, setAvatarVersion] = useState(0);

    const updateAvatar = useCallback((avatarUrl: string) => {
        setAuthState((prev) => ({
            ...prev,
            user: prev.user ? { ...prev.user, avatar_url: avatarUrl } : null,
        }));
        // Incrementa a versão para forçar componentes a atualizarem
        setAvatarVersion((v) => v + 1);
    }, []);

    const didHydrateRef = useRef(false);
    useEffect(() => {
        if (didHydrateRef.current) return;
        didHydrateRef.current = true;
        if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) return;
        void hydrate();
    }, [hydrate, pathname]);

    const value: AuthContextValue = {
        ...authState,
        login,
        forgotPassword,
        logout,
        hydrate,
        updateAvatar,
        avatarVersion,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
