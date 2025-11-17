import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
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
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="space-y-6 m-4 border-0 shadow-none bg-transparent">
                <CardHeader className="space-y-1 p-0">
                    <CardTitle className="text-2xl">Redefina sua senha</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Crie uma nova senha. Para sua segurança, ela precisa ser diferente da
                        anterior.
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <div
                            className="bg-destructive/15 text-destructive text-sm p-3 rounded-md"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="digite sua nova senha"
                                error={errors.password?.message}
                                {...register('password')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirme a senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="confirme sua nova senha"
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword')}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || isSubmitting}
                        >
                            {isLoading || isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
                        </Button>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                            >
                                Voltar para o login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
