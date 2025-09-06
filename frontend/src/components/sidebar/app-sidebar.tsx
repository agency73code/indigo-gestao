'use client';
import * as React from 'react';
import {
    Command,
    Frame,
    LayoutDashboard,
    LifeBuoy,
    Map,
    PieChart,
    Send,
    Settings2,
    UserPlus,
    UserRoundSearchIcon,
} from 'lucide-react';
import { NavMain } from '@/components/sidebar/nav-main';
import { NavProjects } from '@/components/sidebar/nav-projects';
import { NavSecondary } from '@/components/sidebar/nav-secondary';
import { NavUser } from '@/components/sidebar/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
const data = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
    },
    navMain: [
        {
            title: 'Dashboard',
            url: '#',
            icon: LayoutDashboard,
            isActive: true,
            items: [
                {
                    title: 'Atendimentos',
                    url: '#',
                },
                {
                    title: 'Planejamento',
                    url: '#',
                },
                {
                    title: 'Financeiro',
                    url: '#',
                },
            ],
        },
        {
            title: 'Cadastro',
            url: '#',
            icon: UserPlus,
            items: [
                {
                    title: 'Cadastrar Terapeuta',
                    url: '/app/cadastro/terapeuta',
                },
                {
                    title: 'Cadastrar Cliente',
                    url: '/app/cadastro/cliente',
                },
                {
                    title: 'Cadastrar Paciente',
                    url: '/app/cadastro/paciente',
                },
            ],
        },
        {
            title: 'Consulta',
            url: '#',
            icon: UserRoundSearchIcon,
            items: [
                {
                    title: 'Terapeuta',
                    url: '#',
                },
                {
                    title: 'Paciente',
                    url: '#',
                },
            ],
        },
        {
            title: 'Configuração',
            url: '#',
            icon: Settings2,
            items: [
                {
                    title: 'Geral',
                    url: '#',
                },
                {
                    title: 'Team',
                    url: '#',
                },
                {
                    title: 'Faturamento',
                    url: '#',
                },
                {
                    title: 'Limites',
                    url: '#',
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: 'Support',
            url: '#',
            icon: LifeBuoy,
        },
        {
            title: 'Feedback',
            url: '#',
            icon: Send,
        },
    ],
    projects: [
        {
            name: 'Engineering',
            url: '#',
            icon: Frame,
        },
        {
            name: 'Vendas',
            url: '#',
            icon: PieChart,
        },
        {
            name: 'Viagens',
            url: '#',
            icon: Map,
        },
    ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">Instituto Índigo</span>
                                    <span className="truncate text-xs">Administrador</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
