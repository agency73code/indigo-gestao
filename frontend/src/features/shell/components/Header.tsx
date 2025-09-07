import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToggle';
import { Separator } from '@/components/ui/separator';
import DynamicBreadcrumb from '@/shared/components/DynamicBreadcrumb';

export default function Header() {
    return (
        <header className="bg-background sticky top-0 flex h-16 shrink-0 border-l items-center gap-2 border-b px-4 rounded-t-[5px]">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <div className="flex justify-between w-full items-center">
                <DynamicBreadcrumb />
                <ThemeToggle />
            </div>
        </header>
    );
}
