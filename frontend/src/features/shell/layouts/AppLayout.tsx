import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout() {
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