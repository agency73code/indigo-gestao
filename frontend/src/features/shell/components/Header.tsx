import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
    return (
        <header className="fixed top-0 right-0 left-0 z-50 bg-white border-b border-border p-4 flex items-center gap-2 shadow-sm">
            <SidebarTrigger />
            <h1>Header</h1>
        </header>
    );
}
