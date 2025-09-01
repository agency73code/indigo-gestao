import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword, validateResetToken } from "@/lib/api";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import type { ResetPasswordData } from '../../../features/auth/types/auth.types';
import AuthLayout from '../../../features/auth/components/AuthLayout';


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