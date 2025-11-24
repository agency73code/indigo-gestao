import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

const routeToTitleMap: Record<string, string> = {
    '/app': 'Dashboard',
    '/app/cadastros': 'Cadastros',
    '/app/cadastro/terapeuta': 'Cadastro de Terapeuta',
    '/app/cadastro/cliente': 'Cadastro de Cliente',
    '/app/cadastro/paciente': 'Cadastro de Cliente',
    '/app/consultar': 'Consultar',
    '/app/consultar/terapeutas': 'Terapeutas',
    '/app/consultar/pacientes': 'Clientes',
    '/app/arquivos': 'Arquivos',
    '/app/configuracoes': 'Configurações',
    '/app/configuracoes/perfil': 'Perfil & Organização',
    '/app/configuracoes/preferencias': 'Preferências',
    '/app/configuracoes/notificacoes': 'Notificações',
    '/app/configuracoes/seguranca': 'Segurança',
    '/app/configuracoes/integracoes': 'Integrações',
    '/app/programas': 'Programas / Objetivos',
    '/app/programas/fonoaudiologia': 'Fonoaudiologia',
    '/app/programas/psicopedagogia': 'Psicopedagogia',
    '/app/programas/terapia-ocupacional': 'Terapia Ocupacional',
    '/app/programas/movimento': 'Sessão de Movimento',
    '/app/programas/musicoterapia': 'Musicoterapia',
    '/app/programas/lista': 'Listar Programas',
    '/app/programas/novo': 'Criar Programa',
    '/app/programas/sessoes/nova': 'Registrar Sessão',
    '/app/programas/sessoes/consultar': 'Consultar Sessão',
    '/app/programas/terapia-ocupacional/sessoes': 'Consultar Sessões - TO',
    '/app/programas/terapia-ocupacional/sessoes/registrar': 'Registrar Sessão - TO',
    '/app/programas/relatorios/mensal': 'Relatório Geral',
    '/app/relatorios': 'Relatórios',
    '/app/relatorios/lista': 'Relatórios Salvos',
    '/app/relatorios/novo': 'Gerar Relatório',
    '/app/faturamento': 'Faturamento',
    '/app/faturamento/registrar-lancamento': 'Registrar Lançamento',
    '/app/faturamento/minhas-horas': 'Minhas Horas',
    '/app/faturamento/gestao': 'Gestão de Horas',
};

export function useBreadcrumb(): BreadcrumbItem[] {
    const location = useLocation();

    return useMemo(() => {
        const pathname = location.pathname;
        const searchParams = new URLSearchParams(location.search);
        const pacienteId = searchParams.get('pacienteId') ?? searchParams.get('patientId');
        const state = (location.state ?? {}) as { sessionDate?: string } | undefined;

        const preservePacienteId = (href: string) =>
            pacienteId ? `${href}?pacienteId=${pacienteId}` : href;

        if (pathname === '/app' || pathname === '/app/') {
            return [{ label: 'Dashboard' }];
        }

        const exactTitle = routeToTitleMap[pathname];

        if (exactTitle) {
            if (pathname.includes('/cadastro/')) {
                return [
                    { label: 'Cadastros', href: '/app/cadastros' },
                    { label: exactTitle },
                ];
            }

            if (pathname.includes('/consultar/')) {
                return [
                    { label: 'Consultar', href: '/app/consultar' },
                    { label: exactTitle },
                ];
            }

            if (pathname.includes('/configuracoes/')) {
                return [
                    { label: 'Configurações', href: '/app/configuracoes' },
                    { label: exactTitle },
                ];
            }

            if (pathname.includes('/programas/')) {
                return [
                    { label: 'Programas', href: preservePacienteId('/app/programas') },
                    { label: exactTitle },
                ];
            }

            if (pathname.includes('/faturamento/')) {
                return [
                    { label: 'Faturamento', href: '/app/faturamento' },
                    { label: exactTitle },
                ];
            }

            if (pathname.includes('/relatorios/')) {
                return [
                    { label: 'Relatórios', href: '/app/relatorios' },
                    { label: exactTitle },
                ];
            }

            return [{ label: exactTitle }];
        }

        if (pathname.startsWith('/app/programas/') && !pathname.includes('/sessoes/') && !pathname.includes('/relatorios/')) {
            const segments = pathname.split('/');
            const programaId = segments[3];

            if (segments.length === 4) {
                return [
                    { label: 'Programas', href: preservePacienteId('/app/programas') },
                    { label: 'Listar Programas', href: preservePacienteId('/app/programas/lista') },
                    { label: `Programa ${programaId}` },
                ];
            }

            if (segments.length === 5 && segments[4] === 'editar') {
                return [
                    { label: 'Programas', href: preservePacienteId('/app/programas') },
                    { label: 'Listar Programas', href: preservePacienteId('/app/programas/lista') },
                    { label: `Programa ${programaId}`, href: preservePacienteId(`/app/programas/${programaId}`) },
                    { label: 'Editar' },
                ];
            }
        }

        if (pathname.startsWith('/app/programas/sessoes/')) {
            const segments = pathname.split('/');
            const leaf = segments[4];

            if (leaf === 'nova') {
                return [
                    { label: 'Programas', href: preservePacienteId('/app/programas') },
                    { label: 'Registrar Sessão' },
                ];
            }

            if (leaf === 'consultar') {
                return [
                    { label: 'Programas', href: preservePacienteId('/app/programas') },
                    { label: 'Consultar Sessão' },
                ];
            }

            if (leaf) {
                const sessionLabel = state?.sessionDate
                    ? new Date(state.sessionDate).toLocaleDateString('pt-BR')
                    : `Sessão #${leaf}`;

                return [
                    { label: 'Programas', href: preservePacienteId('/app/programas') },
                    { label: 'Consultar Sessão', href: preservePacienteId('/app/programas/sessoes/consultar') },
                    { label: sessionLabel },
                ];
            }
        }

        // Breadcrumbs específicos para TO
        if (pathname.startsWith('/app/programas/terapia-ocupacional/sessoes/')) {
            const segments = pathname.split('/');
            const leaf = segments[5]; // sessoes/:id ou sessoes/registrar

            if (leaf === 'registrar') {
                return [
                    { label: 'Programas', href: '/app/programas' },
                    { label: 'Terapia Ocupacional', href: '/app/programas/terapia-ocupacional' },
                    { label: 'Registrar Sessão' },
                ];
            }

            if (leaf && leaf !== 'registrar') {
                // Detalhe de sessão TO
                const sessionLabel = state?.sessionDate
                    ? new Date(state.sessionDate).toLocaleDateString('pt-BR')
                    : `Sessão`;

                return [
                    { label: 'Programas', href: '/app/programas' },
                    { label: 'Terapia Ocupacional', href: '/app/programas/terapia-ocupacional' },
                    { label: 'Consultar Sessões', href: preservePacienteId('/app/programas/terapia-ocupacional/sessoes') },
                    { label: sessionLabel },
                ];
            }

            // Lista de sessões TO
            return [
                { label: 'Programas', href: '/app/programas' },
                { label: 'Terapia Ocupacional', href: '/app/programas/terapia-ocupacional' },
                { label: 'Consultar Sessões' },
            ];
        }

        if (pathname.startsWith('/app/relatorios/') && pathname !== '/app/relatorios/novo') {
            const segments = pathname.split('/');
            const reportId = segments[3];

            if (reportId && reportId !== 'novo') {
                return [
                    { label: 'Relatórios', href: '/app/relatorios' },
                    { label: 'Visualizar Relatório' },
                ];
            }
        }

        const pathSegments = pathname.split('/').filter(Boolean);
        if (pathSegments.length > 1) {
            const lastSegment = pathSegments[pathSegments.length - 1];
            return [{ label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) }];
        }

        return [{ label: 'Dashboard' }];
    }, [location.pathname, location.search, location.state]);
}

