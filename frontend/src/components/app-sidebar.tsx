import { Home, Calendar, UserPlus, FolderOpen, Settings } from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

// Menu items baseado na estrutura do seu projeto
const items = [
    {
        title: 'Dashboard',
        url: '/app',
        icon: Home,
    },
    {
        title: 'Cadastros',
        url: '/app/cadastros',
        icon: UserPlus,
    },
    {
        title: 'Consultas',
        url: '/app/consultas',
        icon: Calendar,
    },
    {
        title: 'Arquivos',
        url: '/app/arquivos',
        icon: FolderOpen,
    },
    {
        title: 'Configurações',
        url: '/app/configuracoes',
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Indigo Gestão</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
