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
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { loginSchema } from '../../../shared/lib/validations';
import type { LoginCredentials } from '../types/auth.types';

interface LoginFormProps {
    onSubmit: (data: LoginCredentials) => void;
    isLoading?: boolean;
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>({
        resolver: zodResolver(loginSchema),
    });

    return (
        <Card className="w-full max-w-[550px] mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-3xl font-bold tracking-tight text-center">
                    Bem-vindo de volta!
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                    Digite suas credenciais para acessar sua conta
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

                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password')}
                            placeholder="Digite sua senha"
                            aria-invalid={errors.password ? 'true' : 'false'}
                            aria-describedby={errors.password ? 'password-error' : undefined}
                        />
                        {errors.password && (
                            <p
                                id="password-error"
                                className="text-sm text-destructive"
                                role="alert"
                            >
                                {errors.password.message}
                            </p>
                        )}
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                            >
                                Esqueceu sua senha?
                            </Link>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                        aria-describedby={isLoading ? 'loading-text' : undefined}
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                <span id="loading-text">Entrando...</span>
                            </>
                        ) : (
                            'Entrar na conta'
                        )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Não tem uma conta?{' '}
                        <Link
                            to="/sign-up"
                            className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                        >
                            Cadastre-se
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
