'use client';
import * as React from 'react';
import {
    Frame,
    LayoutDashboard,
    LifeBuoy,
    PieChart,
    Send,
    Settings2,
    UserPlus,
    UserRoundSearchIcon,
    Activity,
    ReceiptText,
    FileText,
} from 'lucide-react';
import { NavMain } from '@/components/sidebar/nav-main';
import { NavProjects } from '@/components/sidebar/nav-projects';
import { NavSecondary } from '@/components/sidebar/nav-secondary';
import { NavUser } from '@/components/sidebar/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import type { Actions, Subjects } from '@/features/auth/abilities/ability';
import type { LucideIcon } from 'lucide-react';

interface SidebarSubItem {
  title: string;
  url: string;
  ability?: { action: Actions; subject: Subjects };
}

interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  ability?: { action: Actions; subject: Subjects };
  items?: SidebarSubItem[];
}

const data: {
    user: { name: string; email: string; avatar: string };
    navMain: SidebarItem[];
    navSecondary: { title: string; url: string; icon: LucideIcon }[];
    projects: { name: string; url: string; icon: LucideIcon; target?: string }[];
} = {
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
        },
        {
            title: 'Cliente',
            url: '/app/consultar/pacientes',
            icon: UserRoundSearchIcon,
        },
        {
            title: 'Terapeuta',
            url: '/app/consultar/terapeutas',
            icon: UserPlus,
            ability: { action: 'read', subject: 'Consultar' },
        },
        {
            title: 'Programas & Objetivos',
            url: '/app/programas',
            icon: Activity,
            items: [
                { title: 'Fono e Psicopedagogia', url: '/app/programas/fono-psico' },
                { title: 'Terapia Ocupacional', url: '/app/programas/terapia-ocupacional' },
                { title: 'Sessão de Movimento', url: '/app/programas/movimento' },
                { title: 'Musicoterapia', url: '/app/programas/musicoterapia' },
            ],
        },
        {
            title: 'Relatórios',
            url: '/app/relatorios/lista',
            icon: FileText,
        },
        {
            title: 'Faturamento',
            url: '/app/faturamento',
            icon: ReceiptText,
            items: [
                { title: 'Registrar Lançamento', url: '/app/faturamento/registrar-lancamento' },
                { title: 'Minhas Horas', url: '/app/faturamento/minhas-horas' },
                { title: 'Gestão (gerente)', url: '/app/faturamento/gestao' },
                { title: 'Relatórios/Exportar', url: '/app/faturamento/relatorios' },
            ],
        },
        {
            title: 'Configuração',
            url: '/app/configuracoes',
            icon: Settings2,
            items: [
                { title: 'Perfil & Organização', url: '/app/configuracoes/perfil' },
                { title: 'Preferências', url: '/app/configuracoes/preferencias' },
                { title: 'Notificações', url: '/app/configuracoes/notificacoes' },
                { title: 'Segurança', url: '/app/configuracoes/seguranca' },
                { title: 'Integrações', url: '/app/configuracoes/integracoes' },
            ],
        },
    ],
    navSecondary: [
        { title: 'Suporte', url: '#', icon: LifeBuoy },
        { title: 'Feedback', url: '#', icon: Send },
    ],
    projects: [
        {
            name: 'Indigo Website',
            url: 'https://www.indigoinstituto.com.br/',
            target: '_blank',
            icon: Frame,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar 
            variant="inset" 
            {...props} 
            className="no-print p-1 pr-0"
        >
            <SidebarHeader className="pt-3 pb-2">
                <NavUser />
            </SidebarHeader>
            <SidebarContent className="pt-2">
                <NavMain items={data.navMain} />
                <SidebarSeparator className="mx-0 bg-border/40" />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
        </Sidebar>
    );
}
