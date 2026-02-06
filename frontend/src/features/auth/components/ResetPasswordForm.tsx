import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Button } from '../../../shared/components/ui/button';
import { resetPasswordSchema } from '../../../shared/lib/validations';
import type { ResetPasswordData } from '../types/auth.types';

interface ResetPasswordFormProps {
    onSubmit: (data: ResetPasswordData) => void;
    isLoading?: boolean;
    error?: string;
}

export function ResetPasswordForm({ onSubmit, isLoading, error }: ResetPasswordFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(resetPasswordSchema as any),
    });

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-0 shadow-none bg-transparent max-w-[550px] mx-auto">
                <CardHeader className="space-y-1">
                    <CardTitle style={{ fontSize: '2rem', fontFamily: 'Sora' }} className="tracking-tight">
                        Redefina sua senha
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Crie uma nova senha. Para sua segurança, ela precisa ser diferente da anterior.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0 mt-4">
                    {error && (
                        <motion.div
                            className="mb-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                className="bg-destructive/15 text-destructive text-sm p-3 rounded-[5px]"
                                role="alert"
                            >
                                {error}
                            </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Digite sua nova senha"
                                    {...register('password')}
                                    aria-invalid={errors.password ? 'true' : 'false'}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p
                                    id="password-error"
                                    className="text-sm text-destructive"
                                    role="alert"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {errors.password.message}
                                </motion.p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirme a senha</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirme sua nova senha"
                                    {...register('confirmPassword')}
                                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <motion.p
                                    id="confirmPassword-error"
                                    className="text-sm text-destructive"
                                    role="alert"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {errors.confirmPassword.message}
                                </motion.p>
                            )}
                        </div>

                        <div className="text-end text-sm text-muted-foreground py-1.5">
                            Lembrou da senha?{' '}
                            <Link
                                to="/sign-in"
                                className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                            >
                                Faça login
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full text-sm font-normal group"
                            disabled={isLoading || isSubmitting}
                        >
                            {isLoading || isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                    <span>Redefinindo...</span>
                                </div>
                            ) : (
                                <>
                                    Redefinir senha
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-out group-hover:-rotate-45" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
