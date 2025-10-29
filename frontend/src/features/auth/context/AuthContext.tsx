import { createContext } from 'react';
import type { LoginCredentials, ForgotPasswordData, AuthState } from '../types/auth.types';

export interface AuthContextValue extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    forgotPassword: (data: ForgotPasswordData) => Promise<void>;
    logout: () => Promise<void>;
    hydrate: () => Promise<void>;
    updateAvatar: (avatarUrl: string) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
