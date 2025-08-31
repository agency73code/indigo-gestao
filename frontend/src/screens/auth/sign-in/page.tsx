import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/ui/logo';
import AuthBackground from '@/components/AuthBackground';
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Outfit&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Sora:wght@100..800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Outfit&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Sora:wght@100..800&display=swap');
</style>


export default function SignInPage() {
    return (
        <form action="" className="space-y-6">
            <section className="space-y-4">
                <AuthBackground />
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <Card className="space-y-6">
                    <CardHeader className="space-y-1 p-0">
                        <CardTitle className="text-2xl">Bem-vindo de volta!</CardTitle>
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

                        <Link to="/forgot-password" className="w-full flex justify-end">
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
            </section>
        </form>
    );
}
