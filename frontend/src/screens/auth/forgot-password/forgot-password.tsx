import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@radix-ui/react-separator';
import Logo from '@/components/ui/logo';
import FooterBreadcrumb from '@/components/ui/footer-breadcrumb';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ResetPasswordEmailSent() {
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
                        <CardTitle className="text-2xl">Recuperar acesso</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Informe o e-mail cadastrado pela gestão e siga os passos no seu correio
                            eletrônico.
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

                    <Separator />

                    <Button asChild type="submit" className="w-full">
                        <Link to="/forgot-password/email-sent">Recuperar senha</Link>
                    </Button>
                </Card>
                <FooterBreadcrumb className="mt-4" />
            </section>
        </motion.form>
    );
}
