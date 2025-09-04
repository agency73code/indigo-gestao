import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    return (
        <header className="fixed top-0 right-0 left-0 z-50 bg-background border-b border-border p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Instituto Índigo</h1>
            </div>

            <div className="flex items-center gap-2">
                <ThemeToggle />
            </div>
        </header>
    );
}
