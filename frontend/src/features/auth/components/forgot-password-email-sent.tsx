import { Button } from '@/ui/button';
import { Card, CardHeader, CardTitle } from '@/ui/card';
import Logo from '@/common/components/layout/logo';
import FooterBreadcrumb from '@/features/auth/components/footer-breadcrumb';
import { Link } from 'react-router-dom';

import resetPasswordIcon from '@/assets/images/auth/reset-password-email-sent.svg';
import AuthLayout from './layout';
import AuthBackground from '@/features/auth/components/AuthBackground';

export default function ForgotPasswordEmailSend() {
    return (
        <AuthLayout>
            <form action="" className="space-y-6">
                <section className="space-y-4 flex flex-col">
                    <AuthBackground />
                    <div className="flex justify-center mb-6">
                        <Logo />
                    </div>
                    <Card className="space-y-6 text-center">
                        <div className="flex justify-center mb-6">
                            <img
                                src={resetPasswordIcon}
                                alt="Reset Password"
                                className="w-40 h-32"
                            />
                        </div>
                        <CardHeader className="space-y-1 p-0">
                            <CardTitle className="text-2xl">Confira seu e-mail </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Se o e-mail informado estiver cadastrado, enviamos um link para
                                redefinir sua senha. Ele expira em 60 minutos.
                            </p>
                        </CardHeader>

                        <Button asChild type="submit" className="w-full">
                            <Link to="/sign-in">Voltar para o login</Link>
                        </Button>
                    </Card>
                    <FooterBreadcrumb className="mt-4" />
                </section>
            </form>
        </AuthLayout>
    );
}
