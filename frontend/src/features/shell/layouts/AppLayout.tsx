import { Outlet, useLocation } from 'react-router-dom';
import { Component, createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AbilityProvider } from '@/features/auth/abilities/AbilityProvider';
import { AreaProvider } from '@/contexts/AreaContext';
import PageTransition from '@/shared/components/layout/PageTransition';
import ThemeToggle from '../components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';

type PageTitleContextType = {
    pageTitle: string;
    setPageTitle: (title: string) => void;
    headerActions: ReactNode;
    setHeaderActions: (actions: ReactNode) => void;
    noMainContainer: boolean;
    setNoMainContainer: (value: boolean) => void;
    showBackButton: boolean;
    setShowBackButton: (value: boolean) => void;
    onBackClick?: () => void;
    setOnBackClick: (callback?: () => void) => void;
};

const PageTitleContext = createContext<PageTitleContextType | null>(null);

export function usePageTitle() {
    const context = useContext(PageTitleContext);
    if (!context) {
        // Em vez de quebrar, retorna um objeto mock para evitar crashes
        console.error('usePageTitle must be used within PageTitleProvider');
        return {
            pageTitle: '',
            setPageTitle: () => {},
            headerActions: null,
            setHeaderActions: () => {},
            noMainContainer: false,
            setNoMainContainer: () => {},
            showBackButton: false,
            setShowBackButton: () => {},
            onBackClick: undefined,
            setOnBackClick: () => {},
        } as PageTitleContextType;
    }
    return context;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<
    { children: ReactNode; fallback?: ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: ReactNode; fallback?: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center p-6">
                            <h2 className="text-xl font-semibold mb-4">Algo deu errado!</h2>
                            <p className="text-gray-600 mb-4">
                                {this.state.error?.message || 'Erro desconhecido'}
                            </p>
                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

export default function AppLayout() {
    const [pageTitle, setPageTitle] = useState('');
    const [headerActions, setHeaderActions] = useState<ReactNode>(null);
    const [noMainContainer, setNoMainContainer] = useState(false);
    const [showBackButton, setShowBackButton] = useState(false);
    const [onBackClick, setOnBackClick] = useState<(() => void) | undefined>(undefined);
    const location = useLocation();

    // Lista de rotas que devem ter o botão de voltar
    const routesWithBackButton = useMemo(() => [
        '/app/programas/novo',
        '/app/programas/lista',
        '/app/programas/',
        '/app/programas/sessoes/consultar',
        '/app/programas/sessoes/nova',
        '/app/relatorios/novo',
        '/app/cadastros/vinculos'
    ], []);

    // Verifica se a rota atual deve ter o botão de voltar
    useEffect(() => {
        const shouldShowBackButton = routesWithBackButton.some(route => 
            location.pathname.startsWith(route)
        );
        console.log('[AppLayout] Rota mudou:', location.pathname, 'shouldShow:', shouldShowBackButton);
        setShowBackButton(shouldShowBackButton);
    }, [location.pathname, routesWithBackButton]);

    // Log para debug
    useEffect(() => {
        console.log('[AppLayout] showBackButton mudou para:', showBackButton);
    }, [showBackButton]);

    return (
        <ErrorBoundary>
            <SidebarProvider>
                <AbilityProvider>
                    <AreaProvider>
                        <PageTitleContext.Provider value={{ 
                            pageTitle, 
                            setPageTitle, 
                            headerActions, 
                            setHeaderActions, 
                            noMainContainer, 
                            setNoMainContainer,
                            showBackButton,
                            setShowBackButton,
                            onBackClick,
                            setOnBackClick
                        }}>
                        <div 
                            className="flex h-screen w-full overflow-hidden"
                            style={{ 
                                background: 'var(--blue-moon-gradient)' 
                            }}
                        >
                            <AppSidebar />
                            <div className="flex flex-1 flex-col h-screen p-1 overflow-hidden">
                                {/* Card externo branco */}
                                <div 
                                    className="flex-1 rounded-3xl p-2 flex flex-col gap-3 overflow-hidden bg-white dark:bg-[#1a1a1a]"
                                >
                                    {/* Espaço superior para título e botões */}
                                    <div className="h-12 flex items-center justify-between pt-0 px-1 shrink-0 no-print">
                                        {/* Botão voltar (condicional), sidebar e título */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {showBackButton && (
                                                <BackButton onClick={onBackClick} />
                                            )}
                                            <div className="h-10 w-10 rounded-full bg-header-bg hover:bg-header-bg/80 flex items-center justify-center transition-colors cursor-pointer shrink-0">
                                                <SidebarTrigger className="text-black dark:text-white hover:bg-transparent hover:text-black dark:hover:text-white" />
                                            </div>
                                            {pageTitle && (
                                                <h1 
                                                    className="text-primary text-sm sm:text-base md:text-xl truncate" 
                                                    style={{ 
                                                        fontWeight: 'var(--page-title-font-weight)',
                                                        fontFamily: 'var(--page-title-font-family)'
                                                    }}
                                                >
                                                    {pageTitle}
                                                </h1>
                                            )}
                                        </div>
                                        
                                        {/* Botões de notificação e theme - ocultos no mobile */}
                                        <div className="hidden md:flex items-center gap-3 ml-auto">
                                            {headerActions}
                                            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 relative rounded-full bg-header-bg hover:bg-header-bg/80 transition-colors">
                                                <Bell className="h-4 w-4 text-black dark:text-white" />
                                                <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                                    2
                                                </span>
                                            </Button>
                                            <div className="h-10 w-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
                                                <ThemeToggle />
                                            </div>
                                        </div>
                                        
                                        {/* Header actions visíveis no mobile (ex: botão Exportar PDF) */}
                                        <div className="flex md:hidden items-center ml-auto">
                                            {headerActions}
                                        </div>
                                    </div>
                                    
                                    {/* Card interno com o conteúdo da página - ou renderização direta */}
                                    {noMainContainer ? (
                                        <div className="flex-1 overflow-y-auto min-h-0">
                                            <ErrorBoundary>
                                                <PageTransition>
                                                    <Outlet />
                                                </PageTransition>
                                            </ErrorBoundary>
                                        </div>
                                    ) : (
                                        <main className="flex-1 overflow-y-auto bg-(--bg-main) border border-gray-200/10 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] min-h-0">
                                            <ErrorBoundary>
                                                <PageTransition>
                                                    <Outlet />
                                                </PageTransition>
                                            </ErrorBoundary>
                                        </main>
                                    )}
                                </div>
                            </div>
                        </div>
                    </PageTitleContext.Provider>
                    </AreaProvider>
                </AbilityProvider>
            </SidebarProvider>
        </ErrorBoundary>
    );
}
