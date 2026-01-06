import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState, useCallback } from 'react';
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
import { loginSchema } from '../../../shared/lib/validations';
import type { LoginCredentials } from '../types/auth.types';
import { EyeIcon } from '@/components/EyeIcon';
import { EyeOffIcon } from '@/components/EyeOffIcon';

interface LoginFormProps {
    onSubmit: (data: LoginCredentials) => void;
    isLoading?: boolean;
    error?: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.2,
            ease: 'easeInOut',
        },
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1,
        },
    },
};

export default function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    
    const handleTogglePassword = useCallback(() => {
        setShowPassword(!showPassword);
    }, [showPassword]);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>({
        resolver: zodResolver(loginSchema),
    });

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Card className="max-w-[550px] mx-auto overflow-hidden border-0 shadow-none bg-transparent">
                <motion.div variants={itemVariants}>
                    <CardHeader className="space-y-1">
                        <CardTitle className="tracking-tight font-regular" style={{ fontSize: '2rem', fontFamily: 'Sora' }}>
                            Bem-vindo de volta!
                        </CardTitle>
                        <CardDescription className="text-muted-foreground" style={{ fontSize: '0.8rem' }}>
                            Digite suas credenciais para acessar sua conta
                        </CardDescription>
                    </CardHeader>
                </motion.div>

                {error && (
                    <motion.div
                        className="px-6 pb-2"
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

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <motion.div className="space-y-2" variants={itemVariants}>
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
                                <motion.p
                                    id="email-error"
                                    className="text-sm text-destructive"
                                    role="alert"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {errors.email.message}
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div className="space-y-2" variants={itemVariants}>
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    placeholder="Digite sua senha"
                                    aria-invalid={errors.password ? 'true' : 'false'}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={handleTogglePassword}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {showPassword ? (
                                        <EyeOffIcon size={18} />
                                    ) : (
                                        <EyeIcon size={18} />
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
                            <div className="text-right">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                                >
                                    Esqueceu sua senha?
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button
                                type="submit"
                                className="w-full text-sm font-normal group"
                                disabled={isLoading}
                                aria-describedby={isLoading ? 'loading-text' : undefined}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                        <span id="loading-text">Entrando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Entrar na conta</span>
                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-rotate-45" />
                                    </div>
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
