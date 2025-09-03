import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials, SignUpCredentials, ForgotPasswordData, ResetPasswordData } from '../types/auth.types';
import type { User, AuthState } from '../types/auth.types';
import { signIn, forgotPassword as forgotPasswordApi, getMe, apiLogout } from '@/lib/api'

const AUTH_BYPASS =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true';

// Simulação de serviço de API - substituir por implementação real
const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    // Simulação de chamada API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
      return {
        user: { id: '1', email: credentials.email, firstName: 'Admin', lastName: 'User' },
        token: 'fake-jwt-token'
      };
    }
    throw new Error('Credenciais inválidas');
  },
  
  signUp: async (data: SignUpCredentials): Promise<{ user: User; token: string }> => {
    // Simulação de chamada API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      user: { 
        id: Date.now().toString(), 
        email: data.email, 
        firstName: data.firstName, 
        lastName: data.lastName 
      },
      token: 'fake-jwt-token'
    };
  },
  
  forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
    // Simulação de chamada API
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Reset email sent to:', data.email);
  },
  
  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    // Simulação de chamada API
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password reset for:', data);
  }
};

export function useAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await getMe();
        if (!active) return;
        setAuthState({
          user: { id: String(me.user.id), email: me.user.email ?? "teste@teste.com", name: me.user.name ?? "teste" },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch {
        if (AUTH_BYPASS && active) {
          setAuthState({
            user: { id: "dev-uid", email: "teste@teste.com", name: "teste" },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }
      }
    })();
    return () => { active = false }
  }, []);

  // endpoint responsavel pelo login
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
        
        navigate('/app');

      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erro ao fazer login'
        setAuthState((prev) => ({ ...prev, isLoading: false, error: msg }));
      }
    },
    [navigate]
  )

  // endpoint responsavel pelo Cadastro
  const signUp = useCallback(async (data: SignUpCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user } = await authService.signUp(data);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      navigate('/app');

    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao criar conta',
      }));
    }
  }, [navigate]);

  // endpoint responsavel pelo esqueci minha senha
  const forgotPassword = useCallback(async ({ email }: ForgotPasswordData) => {
    try {
      setIsLoading(true);
      await forgotPasswordApi(email);
      navigate('/forgot-password/email-sent');
    } catch {
      navigate('/forgot-password/email-sent')
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.resetPassword(data);
      navigate('/reset-success');
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao redefinir senha',
      }));
    }
  }, [navigate]);

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

  return {
    ...authState,
    login,
    signUp,
    forgotPassword,
    isLoading,
    resetPassword,
    logout,
  };
}
