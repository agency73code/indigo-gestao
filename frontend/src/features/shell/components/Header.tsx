import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export default function Header() {
    return (
        <header className="bg-background sticky top-0 flex h-16 shrink-0 border-l items-center gap-2 border-b px-4 rounded-t-[5px]">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb className='flex justify-between w-full'>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
            <ThemeToggle />
          </Breadcrumb>
        </header>
    );
}
