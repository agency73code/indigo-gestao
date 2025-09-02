import Logo from '../../../shared/components/ui/logo';
import FooterBreadcrumb from '../../../shared/components/ui/footer-breadcrumb';
import AuthBackground from '@/features/auth/components/AuthBackground';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center">
            <AuthBackground />

            <div className="relative z-10 w-full max-w-[550px] space-y-6">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>

                <div className="p-0">{children}</div>

                <div>
                    <FooterBreadcrumb className="mt-4" />
                </div>
            </div>
        </div>
    );
}
