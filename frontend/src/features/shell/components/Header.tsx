import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToggle';
import { Separator } from '@/components/ui/separator';
import DynamicBreadcrumb from '@/shared/components/DynamicBreadcrumb';
import { NavUser } from '@/components/sidebar/nav-user';
import { GlobalSearch } from '@/components/Dashboard/global-search';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
    return (
        <header className="bg-background sticky top-0 flex h-16 shrink-0 border-l items-center gap-2 border-b px-4 rounded-t-[5px]">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <div className="flex justify-between w-full items-center gap-4">
                <DynamicBreadcrumb />
                <GlobalSearch className="flex-1 max-w-xs mx-4" />
                <div className="flex items-center gap-2">
                    <div className="hidden md:block">
                        <NavUser />
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                        <Bell className="h-4 w-4" />
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                            2
                        </span>
                    </Button>
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
