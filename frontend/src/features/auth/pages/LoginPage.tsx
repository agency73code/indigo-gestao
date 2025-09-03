import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/auth.types';

export default function LoginPage() {
    const { login, isLoading, error } = useAuth();

    const handleSubmit = async (data: LoginCredentials) => {
        await login(data);
    };

    return (
        <AuthLayout>
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error || undefined} />
        </AuthLayout>
    );
}
