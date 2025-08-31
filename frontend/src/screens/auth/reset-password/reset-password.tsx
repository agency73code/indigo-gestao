import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/ui/logo';
import FooterBreadcrumb from '@/components/ui/footer-breadcrumb';

export default function ResetPassword() {
    return (
        <form action="" className="space-y-6">
            <section className="space-y-4">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <Card className="space-y-6">
                    <CardHeader className="space-y-1 p-0">
                        <CardTitle className="text-2xl">Redefina sua senha </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Crie uma nova senha. Para sua segurança, ela precisa ser diferente da
                            anterior.
                        </p>
                    </CardHeader>

                    <div className="space-y-1 mb">
                        <Label htmlFor="password">Nova Senha</Label>
                        <Input
                            name="password"
                            type="password"
                            id="password"
                            placeholder="digite sua senha"
                            className="mb-4"
                        />
                        <Label htmlFor="password">Confirme a senha</Label>
                        <Input
                            name="password"
                            type="password"
                            id="password"
                            placeholder="digite sua senha"
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        Recuperar senha
                    </Button>
                </Card>
                <FooterBreadcrumb className="mt-4" />
            </section>
        </form>
    );
}
