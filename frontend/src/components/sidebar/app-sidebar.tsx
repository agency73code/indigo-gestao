'use client';
import * as React from 'react';
import indigoLogo from '@/assets/logos/indigo.svg';
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
import { useAuth } from '@/features/auth/hooks/useAuth';
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
            title: 'Programas/Objetivos',
            url: '/app/programas',
            icon: Activity,
            items: [
                { title: 'Consultar Programas', url: '/app/programas/lista' },
                { title: 'Novo Programa', url: '/app/programas/novo' },
                { title: 'Consultar Sessão', url: '/app/programas/sessoes/consultar' },
                { title: 'Nova Sessão', url: '/app/programas/sessoes/nova' },
                { title: 'Relatório', url: '/app/programas/relatorios/mensal' },
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

function capitalize(word: string) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth();
    const displayAcesso = capitalize(user?.perfil_acesso ?? '-');
    const displayAvatar = indigoLogo;

    return (
        <Sidebar variant="inset" {...props} className="no-print">
            <SidebarHeader className="pt-">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a className="flex pt-4 flex-col min-h-fit items-center" href="#">
                                <div className="mb-4">
                                    <img
                                        src={displayAvatar}
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
                                        {displayAcesso}
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
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter className="md:hidden">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
