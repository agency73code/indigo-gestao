import { Outlet } from 'react-router-dom';

import { AuthProvider } from '@/features/auth/context/AuthProvider';
import PageTransition from '@/shared/components/layout/PageTransition';

export default function AuthProviderLayout() {
    return (
        <AuthProvider>
            <PageTransition>
                <Outlet />
            </PageTransition>
        </AuthProvider>
    );
}
