'use client';
import * as React from 'react';
import {
    Frame,
    LayoutDashboard,
    LifeBuoy,
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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProgramAreas } from '@/features/programas/core/hooks/useProgramConfig';

interface SidebarSubItem {
  title: string;
  url: string;
  ability?: { action: Actions; subject: Subjects };
  status?: 'em-breve' | 'quase-pronto';
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
    const { user } = useAuth();
    const programAreas = useProgramAreas(user);

    const programItems: SidebarSubItem[] = programAreas.map((area): SidebarSubItem => ({
        title: area.title,
        url: area.path,
        status:
        area.implemented === true
            ? undefined
            : area.implemented === 'in-progress'
            ? 'quase-pronto'
            : 'em-breve',
    }));

    const navMain: SidebarItem[] = [
    ...data.navMain.slice(0, 3), // Dashboard, Cliente, Terapeuta

    {
        title: 'Programas & Objetivos',
        url: '/app/programas',
        icon: Activity,
        items: programItems,
    },

    ...data.navMain.slice(3, 6), // Relatórios em diante
    ];

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
                <NavMain items={navMain} />
                <SidebarSeparator className="mx-0 bg-border/40" />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
        </Sidebar>
    );
}
