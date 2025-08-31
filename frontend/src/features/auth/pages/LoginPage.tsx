import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
    const { login, isLoading } = useAuth();

    return (
        <AuthLayout>
            <LoginForm onSubmit={login} isLoading={isLoading} />
        </AuthLayout>
    );
}
