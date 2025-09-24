export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  perfil_acesso: string;
  avatar_url?: string | null 
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
  token?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
