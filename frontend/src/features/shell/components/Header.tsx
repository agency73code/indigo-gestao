import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToggle';
import { Separator } from '@/components/ui/separator';
import DynamicBreadcrumb from '@/shared/components/DynamicBreadcrumb';
import { NavUser } from '@/components/sidebar/nav-user';
import { GlobalSearch } from '@/components/Dashboard/global-search';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useArea } from '@/contexts/AreaContext';
import { Badge } from '@/components/ui/badge';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentArea, getAreaLabel } = useArea();

    const handleGoBack = () => {
        navigate(-1);
    };

    // Verifica se está na seção de programas
    const isInProgramsSection = location.pathname.includes('/app/programas');

    return (
        <header className="bg-background sticky top-0 z-50 flex h-16 shrink-0 items-center gap-1 px-4 rounded-xl no-print">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
            <div className="flex justify-between w-full items-center gap-2">
                <div className="flex items-center gap-2">
                    <DynamicBreadcrumb />
                    {isInProgramsSection && currentArea && (
                        <Badge variant="secondary" className="hidden sm:flex">
                            {getAreaLabel()}
                        </Badge>
                    )}
                </div>
                {/* Botão de voltar - apenas mobile */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden h-8 w-8 p-0"
                    onClick={handleGoBack}
                    aria-label="Voltar para página anterior"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <GlobalSearch className="flex-1 max-w-full mx-2" />
                <div className="flex items-center gap-1">
                    <div className="hidden md:block">
                        <NavUser />
                    </div>
                    {/* TODO: Implementar sistema de notificações
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                        <Bell className="h-4 w-4" />
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                            2
                        </span>
                    </Button>
                    <Separator
                        orientation="vertical"
                        className="mx-1 data-[orientation=vertical]:h-4"
                    />
                    */}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
