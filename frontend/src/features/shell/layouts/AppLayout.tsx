import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect, useRef } from 'react';

export default function AppLayout() {
    const { hydrate } = useAuth();
    const didHydrateRef = useRef(false);

    useEffect(() => {
        if (didHydrateRef.current) return;
        didHydrateRef.current = true; // evita a 2ª execução do StrictMode em dev
        void hydrate();
    }, [hydrate]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex min-h-screen flex-col">
                <Header />
                <div className="flex-1 p-4">
                    <Outlet />
                </div>
                <Footer />
            </SidebarInset>
        </SidebarProvider>
    );
}