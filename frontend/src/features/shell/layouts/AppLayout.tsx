import { Outlet } from 'react-router-dom';
import { Component } from 'react';
import type { ReactNode } from 'react';
import Header from '../components/Header';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

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
    return (
        <ErrorBoundary>
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <div className="flex flex-1 flex-col">
                        <Header />
                        <main className="flex-1 p-4 pt-20">
                            <ErrorBoundary>
                                <Outlet />
                            </ErrorBoundary>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </ErrorBoundary>
    );
}
