import AuthLayout from '../components/AuthLayout';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import { useAuth } from '../hooks/useAuth';

//type FormData = { email: string }

export default function ForgotPasswordPage() {
    const { forgotPassword, isLoading } = useAuth();

    return (
        <AuthLayout>
            <ForgotPasswordForm onSubmit={forgotPassword} isLoading={isLoading} />
        </AuthLayout>
    );
}

