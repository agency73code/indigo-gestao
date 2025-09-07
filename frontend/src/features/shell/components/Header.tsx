import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    return (
        <header className="bg-background border-b border-border min-h-screen m-3 rounded-[5px] flex justify-between shadow-sm">
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className="flex gap-2">
                    <SidebarTrigger />
                </div>

                <div className="flex gap-2">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
