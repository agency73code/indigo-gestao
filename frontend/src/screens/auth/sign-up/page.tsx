import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/ui/logo';
import { motion } from 'framer-motion';
import FooterBreadcrumb from '@/components/ui/footer-breadcrumb';

export default function SignUpPage() {
    return (
        <motion.form 
            action="" 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <section className="space-y-4">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <Card className="space-y-6">
                    <CardHeader className="space-y-1 p-0">
                        <CardTitle className="text-2xl font-bold">Bem-vindo de volta!</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Insira suas credenciais para acessar sua conta
                        </p>
                    </CardHeader>

                    <div className="space-y-1">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            name="email"
                            type="emial"
                            id="email"
                            placeholder="digite seu email"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            name="password"
                            type="password"
                            id="password"
                            placeholder="digite sua senha"
                        />

                        <Link to="/auth/forgot-password" className="w-full flex justify-end">
                            <p className="text-xs text-foreground hover:underline ">
                                Esqueceu sua senha?
                            </p>
                        </Link>
                    </div>

                    <Button type="submit" className="w-full">
                        Entrar na sua conta
                    </Button>

                    <Separator />

                    <Button type="submit" variant="outline" className="w-full">
                        Entrar com Google
                    </Button>
                </Card>
                <FooterBreadcrumb className="mt-4" />
            </section>
        </motion.form>
    );
}
