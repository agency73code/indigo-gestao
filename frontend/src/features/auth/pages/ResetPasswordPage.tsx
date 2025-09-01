import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword, validateResetToken } from "@/lib/api";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import type { ResetPasswordData } from '../types/auth.types';
import AuthLayout from '../components/AuthLayout';
import TokenNotFoundPage from "@/shared/components/pages/TokenNotFoundPage";


export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || "";

    useEffect(() => {
        async function validate() {
            try {
                await validateResetToken(token);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Erro inesperado");
                }
            }
        }
        if (token) validate();
    }, [token]);

    const handleSubmit = async (data: ResetPasswordData) => {
        try {
            setIsLoading(true);
            setError(null);
            await resetPassword(token, data.password, data.confirmPassword);
            navigate('/reset-success')
        } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Erro inesperado");
                }
        } finally {
            setIsLoading(false);
        }
    };

    if (!token || error) {
        return (
            <AuthLayout>
                <TokenNotFoundPage />
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <ResetPasswordForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error || undefined}
            />
        </AuthLayout>
        
    )
}