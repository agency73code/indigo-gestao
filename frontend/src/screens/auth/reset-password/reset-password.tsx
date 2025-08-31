import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/ui/logo';
import FooterBreadcrumb from '@/components/ui/footer-breadcrumb';
import AuthLayout from '../layout';
import AuthBackground from '@/components/AuthBackground';

// KAIO
import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// KAIO
const API = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
    // KAIO
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = params.get('token') ?? '';

    const [loading, setLoading] = React.useState(true);
    const [valid, setValid] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        async function validate() {
            if (!token) {
                setError('Token ausente na URL');
                setLoading(false);
                return;
            }

            try {
                const resp = await fetch(`${API}/auth/password-reset/validate/${token}`);
                if (cancelled) return;
                if (resp.status === 204) setValid(true);
                else if (resp.status === 401) setError('Token inválido ou expirado');
                else setError('Falha ao validar o token.');
            } catch {
                if (!cancelled) setError('Erro de rede ao validar o token.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        validate();
        return () => {
            cancelled = true;
        };
    }, [token]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não conferem.');
            return;
        }

        try {
            const resp = await fetch(`${API}/auth/password-reset/${token}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, confirmPassword }),
            });

            if (resp.ok) {
                navigate('/reset-success');
            } else {
                const data = await resp.json().catch(() => ({}));
                setError(data?.message || data?.error || 'Falha ao definir a senha.');
            }
        } catch {
            setError('Erro de rede ao salvar senha.');
        }
    }

    if (loading) {
        return (
            <section className="space-y-4">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <Card className="p-6">Validando token…</Card>
            </section>
        );
    }

    if (!valid) {
        return (
            <section className="space-y-4">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                <Card className="p-6 text-red-600">{error || 'Token inválido.'}</Card>
            </section>
        );
    }

    return (
        <AuthLayout>
            <form onSubmit={onSubmit} className="space-y-6">
                <section className="space-y-4">
                    <AuthBackground />
                    <div className="flex justify-center mb-6">
                        <Logo />
                    </div>
                    <Card className="space-y-6">
                        <CardHeader className="space-y-1 p-0">
                            <CardTitle className="text-2xl">Redefina sua senha </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Crie uma nova senha. Para sua segurança, ela precisa ser diferente
                                da anterior.
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Label htmlFor="confirmPassword">Confirme a senha</Label>
                            <Input
                                name="confirmPassword"
                                type="confirmPassword"
                                id="confirmPassword"
                                placeholder="digite sua senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Recuperar senha
                        </Button>
                    </Card>
                    <FooterBreadcrumb className="mt-4" />
                </section>
            </form>
        </AuthLayout>
    );
}
