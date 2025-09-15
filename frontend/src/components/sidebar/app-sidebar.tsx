'use client';
import * as React from 'react';
import indigoLogo from '@/assets/logos/indigo.svg';
import { useAbility } from '@/features/auth/abilities/useAbility';
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
    Activity,
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
            url: '/app/cadastros',
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
            url: '/app/consultas',
            icon: UserRoundSearchIcon,
            items: [
                {
                    title: 'Terapeuta',
                    url: '/app/consultas/terapeutas',
                },
                {
                    title: 'Paciente',
                    url: '/app/consultas/pacientes',
                },
            ],
        },
        {
            title: 'Programas',
            url: '/app/programas',
            icon: Activity,
            items: [
                {
                    title: 'Consultar Programas',
                    url: '/app/programas/lista',
                },
                {
                    title: 'Criar Programa',
                    url: '/app/programas/novo',
                },
                {
                    title: 'Registrar Sessão',
                    url: '/app/programas/sessoes/nova',
                },
                {
                    title: 'Relatório Mensal',
                    url: '/app/programas/relatorios/mensal',
                },
            ],
        },
        {
            title: 'Configuração',
            url: '/app/configuracoes',
            icon: Settings2,
            items: [
                {
                    title: 'Perfil & Organização',
                    url: '/app/configuracoes/perfil',
                },
                {
                    title: 'Preferências',
                    url: '/app/configuracoes/preferencias',
                },
                {
                    title: 'Notificações',
                    url: '/app/configuracoes/notificacoes',
                },
                {
                    title: 'Segurança',
                    url: '/app/configuracoes/seguranca',
                },
                {
                    title: 'Integrações',
                    url: '/app/configuracoes/integracoes',
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

function capitalize(word: string) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth();
    const displayAcesso = capitalize(user?.perfil_acesso ?? '-');
    const displayAvatar = indigoLogo;
    const ability = useAbility();

    // verifica o nome da rota do nav, ajuda a mapear
    //console.log("DEBUG navMain original:", data.navMain.map(i => i.url))

    const navMainFiltered = data.navMain.filter((item) => {
        if (item.url === '/app/cadastros' && !ability.can('manage', 'Cadastro')) return false
        return true
    });

    return (
        <Sidebar variant="inset" {...props}>
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
                <NavMain items={navMainFiltered} />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto " />
            </SidebarContent>
            <SidebarFooter className="md:hidden">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
