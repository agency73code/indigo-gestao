import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { signUpSchema } from '../../../shared/lib/validations';
import type { SignUpCredentials } from '../types/auth.types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../../components/ui/card';

interface SignUpFormProps {
    onSubmit: (data: SignUpCredentials) => void;
    isLoading?: boolean;
}

export default function SignUpForm({ onSubmit, isLoading = false }: SignUpFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpCredentials>({
        resolver: zodResolver(signUpSchema),
    });

    return (
        <Card className="w-full max-w-[550px] mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl tracking-tight">
                    Criar conta
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Digite suas informações para criar sua conta
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nome</Label>
                            <Input
                                id="firstName"
                                {...register('firstName')}
                                placeholder="Digite seu nome"
                                aria-invalid={errors.firstName ? 'true' : 'false'}
                                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                            />
                            {errors.firstName && (
                                <p
                                    id="firstName-error"
                                    className="text-sm text-destructive"
                                    role="alert"
                                >
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Sobrenome</Label>
                            <Input
                                id="lastName"
                                {...register('lastName')}
                                placeholder="Digite seu sobrenome"
                                aria-invalid={errors.lastName ? 'true' : 'false'}
                                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                            />
                            {errors.lastName && (
                                <p
                                    id="lastName-error"
                                    className="text-sm text-destructive"
                                    role="alert"
                                >
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar senha</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            {...register('confirmPassword')}
                            placeholder="Confirme sua senha"
                            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                            aria-describedby={
                                errors.confirmPassword ? 'confirmPassword-error' : undefined
                            }
                        />
                        {errors.confirmPassword && (
                            <p
                                id="confirmPassword-error"
                                className="text-sm text-destructive"
                                role="alert"
                            >
                                {errors.confirmPassword.message}
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
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                <span id="loading-text">Criando conta...</span>
                            </>
                        ) : (
                            'Criar conta'
                        )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Já tem uma conta?{' '}
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
