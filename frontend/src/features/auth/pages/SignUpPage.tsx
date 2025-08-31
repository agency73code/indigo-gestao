import AuthLayout from '../components/AuthLayout';
import SignUpForm from '../components/SignUpForm';
import { useAuth } from '../hooks/useAuth';

export default function SignUpPage() {
    const { signUp, isLoading } = useAuth();

    return (
        <AuthLayout>
            <SignUpForm onSubmit={signUp} isLoading={isLoading} />
        </AuthLayout>
    );
}
