import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@radix-ui/react-separator';
import Logo from '@/components/ui/logo';

export default function ForgotPasswordPage() {
    return (
        <form action="" className="space-y-6">
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

                    <Button type="submit" className="w-full">
                        Recuperar senha
                    </Button>
                </Card>
            </section>
        </form>
    );
}
