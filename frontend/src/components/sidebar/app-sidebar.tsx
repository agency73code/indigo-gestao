'use client';
import * as React from 'react';
import {
    Frame,
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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProgramAreas } from '@/features/programas/core/hooks/useProgramConfig';
import {
    AnimatedIcons,
    type AnimatedIconComponent,
} from '@/components/sidebar/animated-icons';
import type { LucideIcon } from 'lucide-react';

interface SidebarSubItem {
  title: string;
  url: string;
  ability?: { action: Actions; subject: Subjects };
  status?: 'em-breve' | 'quase-pronto';
}

// Tipo que aceita tanto LucideIcon quanto AnimatedIconComponent
type SidebarIconType = LucideIcon | AnimatedIconComponent;

interface SidebarItem {
  title: string;
  url: string;
  icon: SidebarIconType;
  isActive?: boolean;
  ability?: { action: Actions; subject: Subjects };
  items?: SidebarSubItem[];
}

const data: {
    user: { name: string; email: string; avatar: string };
    navMain: SidebarItem[];
    navSecondary: { title: string; url: string; icon: SidebarIconType; target?: string }[];
    projects: { name: string; url: string; icon: LucideIcon; target?: string }[];
} = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
    },
    navMain: [
        // Dashboard temporariamente desabilitado - funcionalidade incompleta
        // {
        //     title: 'Dashboard',
        //     url: '/app',
        //     icon: AnimatedIcons.Dashboard,
        // },
        {
            title: 'Cliente',
            url: '/app/consultar/pacientes',
            icon: AnimatedIcons.UserRoundSearch,
        },
        {
            title: 'Terapeuta',
            url: '/app/consultar/terapeutas',
            icon: AnimatedIcons.UserPlus,
            ability: { action: 'read', subject: 'Consultar' },
        },
        {
            title: 'Anamnese',
            url: '/app/anamnese/lista',
            icon: AnimatedIcons.Clipboard,
        },
        {
            title: 'Atas de Reunião',
            url: '/app/atas',
            icon: AnimatedIcons.BookOpen,
        },
        {
            title: 'Relatórios',
            url: '/app/relatorios/lista',
            icon: AnimatedIcons.BookOpenText,
        },
        {
            title: 'Faturamento',
            url: '/app/faturamento',
            icon: AnimatedIcons.Wallet,
        },
        {
            title: 'Configuração',
            url: '/app/configuracoes',
            icon: AnimatedIcons.Settings,
        },
    ],
    navSecondary: [
        { title: 'Suporte', url: 'https://wa.me/5511958017828?text=Olá! Preciso de suporte com o sistema Indigo.', icon: AnimatedIcons.Headset, target: '_blank' },
        { title: 'Feedback', url: 'https://wa.me/5511958017828?text=Olá! Gostaria de enviar um feedback sobre o sistema Indigo.', icon: AnimatedIcons.Send, target: '_blank' },
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
        icon: AnimatedIcons.Activity,
        items: programItems,
    },

    ...data.navMain.slice(3), // Anamnese, Relatórios, Faturamento, Configuração
    ];

    return (
        <Sidebar 
            variant="inset" 
            collapsible="icon"
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
