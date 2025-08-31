import AuthBackground from '../../../shared/components/layout/AuthBackground';
import Logo from '../../../shared/components/ui/logo';
import FooterBreadcrumb from '../../../shared/components/ui/footer-breadcrumb';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <AuthBackground />
            <div className="relative z-10 w-full max-w-[550px] space-y-6">
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>
                {children}
                <FooterBreadcrumb className="mt-4" />
            </div>
        </div>
    );
}
