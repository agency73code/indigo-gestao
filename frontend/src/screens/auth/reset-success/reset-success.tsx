import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/ui/logo';

import resetPasswordIcon from '@/assets/images/auth/reset-password.svg';

export default function ResetSuccess() {
    return (
        <form action="" className="space-y-6">
            <section className="space-y-4 flex flex-col">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <Card className="space-y-6 text-center">
                    <div className="flex justify-center mb-6">
                        <img src={resetPasswordIcon} alt="Reset Password" className="w-40 h-32" />
                    </div>
                    <CardHeader className="space-y-1 p-0">
                        <CardTitle className="text-2xl font-bold">
                            Senha alterada com sucesso!{' '}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Pronto! Agora você já pode usar sua nova senha para acessar a conta.
                            anterior.
                        </p>
                    </CardHeader>

                    <Button type="submit" className="w-full">
                        Voltar para o login{' '}
                    </Button>
                </Card>
            </section>
        </form>
    );
}
