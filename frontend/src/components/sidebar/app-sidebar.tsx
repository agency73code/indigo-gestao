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
            items: [
                { title: 'Atendimentos', url: '/app/atendimentos' },
                { title: 'Planejamento', url: '/app/planejamento' },
                { title: 'Financeiro', url: '/app/financeiro' },
            ],
        },
        {
            title: 'Cadastro',
            url: '/app/cadastros',
            icon: UserPlus,
            ability: { action: 'create', subject: 'Cadastro' },
            items: [
                { title: 'Cadastrar Terapeuta', url: '/app/cadastro/terapeuta', ability: { action: 'manage', subject: 'all' } },
                { title: 'Cadastrar Cliente', url: '/app/cadastro/cliente' },
                { title: 'Vínculos', url: '/app/cadastros/vinculos' },
            ],
        },
        {
            title: 'Consultar',
            url: '/app/consultar',
            icon: UserRoundSearchIcon,
            items: [
                { title: 'Terapeuta', url: '/app/consultar/terapeutas', ability: { action: 'manage', subject: 'all' } },
                { title: 'Cliente', url: '/app/consultar/pacientes' },
            ],
        },
        {
            title: 'Programas & Objetivos',
            url: '/app/programas',
            icon: Activity,
            items: [
                { title: 'Consultar Programas', url: '/app/programas/lista' },
                { title: 'Novo Programa', url: '/app/programas/novo' },
                { title: 'Consultar Sessão', url: '/app/programas/sessoes/consultar' },
                { title: 'Nova Sessão', url: '/app/programas/sessoes/nova' },
            ],
        },
        {
            title: 'Relatórios',
            url: '/app/relatorios',
            icon: FileText,
            items: [
                { title: 'Relatórios Salvos', url: '/app/relatorios/lista' },
                { title: 'Gerar Relatório', url: '/app/relatorios/novo' },
            ],
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
        { title: 'Support', url: '#', icon: LifeBuoy },
        { title: 'Feedback', url: '#', icon: Send },
    ],
    projects: [
        {
            name: 'Indigo Website',
            url: 'https://www.indigoinstituto.com.br/',
            target: '_blank',
            icon: Frame,
        },
        { name: 'Lançamento curso', url: '#', icon: PieChart },
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
