import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '../../../components/ui/card';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Button } from '../../../shared/components/ui/button';
import { forgotPasswordSchema } from '../../../shared/lib/validations';
import type { ForgotPasswordData } from '../types/auth.types';

interface ForgotPasswordFormProps {
    onSubmit: (data: ForgotPasswordData) => void;
    isLoading?: boolean;
}

export default function ForgotPasswordForm({
    onSubmit,
    isLoading = false,
}: ForgotPasswordFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    return (
        <Card className="w-full max-w-[550px] mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl tracking-tight">Esqueci minha senha</CardTitle>
                <CardDescription className=" text-muted-foreground">
                    Digite seu e-mail para receber as instruções de recuperação
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="Digite seu e-mail"
                            aria-invalid={errors.email ? 'true' : 'false'}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && (
                            <p id="email-error" className="text-sm text-destructive" role="alert">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                        aria-describedby={isLoading ? 'loading-text' : undefined}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                <span id="loading-text">Enviando...</span>
                            </div>
                        ) : (
                            'Enviar instruções'
                        )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Lembrou da senha?{' '}
                        <Link
                            to="/sign-in"
                            className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                        >
                            Faça login
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
