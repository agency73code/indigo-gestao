'use client';
import * as React from 'react';
import indigoLogo from '@/assets/logos/indigo.svg';

import {
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
            url: '/app',
            icon: LayoutDashboard,
            isActive: true,
            items: [
                {
                    title: 'Atendimentos',
                    url: '/app/atendimentos',
                },
                {
                    title: 'Planejamento',
                    url: '/app/planejamento',
                },
                {
                    title: 'Financeiro',
                    url: '/app/financeiro',
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
            <SidebarHeader className="pt-">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a className="flex pt-4 flex-col min-h-fit items-center" href="#">
                                <div className="mb-4">
                                    <img
                                        src={indigoLogo}
                                        alt={data.user.name}
                                        className="w-24 h-24 rounded-full border border-border"
                                    />
                                </div>
                                <div className="flex flex-col items-center text-center text-sm leading-tight">
                                    <span
                                        className="font-medium block mb-1"
                                        style={{ fontFamily: 'Sora, sans-serif' }}
                                    >
                                        Instituto Índigo
                                    </span>
                                    <span className="text-xs block text-muted-foreground">
                                        Administrador
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="pt-2">
                <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto " />
            </SidebarContent>
            <SidebarFooter className="md:hidden">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
