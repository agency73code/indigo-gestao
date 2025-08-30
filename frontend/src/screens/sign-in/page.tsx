import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';

export default function SignInPage() {
    return (
        <form action="" className="space-y-6">
            <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input name="email" type="emial" id="email" />
            </div>

            <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input name="password" type="password" id="password" />

                <Link to="/auth/forgot-password" className="w-full flex justify-end">
                    <p className="text-xs text-foreground hover:underline ">Esqueci minha senha</p>
                </Link>
            </div>
        </form>
    );
}
