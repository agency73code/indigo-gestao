import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Mapeamento das rotas para os títulos
const routeToTitleMap: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/cadastros': 'Cadastros',
  '/app/cadastro/terapeuta': 'Cadastro de Terapeuta',
  '/app/cadastro/cliente': 'Cadastro de Cliente',
  '/app/cadastro/paciente': 'Cadastro de Paciente',
  '/app/consultas': 'Consultas',
  '/app/consultas/terapeutas': 'Terapeutas',
  '/app/consultas/pacientes': 'Pacientes',
  '/app/arquivos': 'Arquivos',
  '/app/configuracoes': 'Configurações',
  '/app/configuracoes/perfil': 'Perfil & Organização',
  '/app/configuracoes/preferencias': 'Preferências',
  '/app/configuracoes/notificacoes': 'Notificações',
  '/app/programas': 'Programas de Treino (OCP)',
  '/app/programas/lista': 'Listar Programas',
  '/app/programas/novo': 'Criar Programa',
  '/app/programas/sessoes/nova': 'Registrar Sessão',
  '/app/programas/relatorios/mensal': 'Relatório Mensal',
  '/app/configuracoes/seguranca': 'Segurança',
  '/app/configuracoes/integracoes': 'Integrações',
};

export function useBreadcrumb(): BreadcrumbItem[] {
  const location = useLocation();

  return useMemo(() => {
    const pathname = location.pathname;
    
    // Se estamos na rota raiz do app, retorna apenas Dashboard
    if (pathname === '/app' || pathname === '/app/') {
      return [{ label: 'Dashboard' }];
    }

    // Verifica se existe um título específico para a rota completa
    const exactTitle = routeToTitleMap[pathname];
    
    if (exactTitle) {
      // Para rotas de cadastro específicas, criamos a hierarquia
      if (pathname.includes('/cadastro/')) {
        return [
          {
            label: 'Cadastros',
            href: '/app/cadastros'
          },
          {
            label: exactTitle
          }
        ];
      }
      
      // Para rotas de consulta específicas, criamos a hierarquia
      if (pathname.includes('/consultas/')) {
        return [
          {
            label: 'Consultas',
            href: '/app/consultas'
          },
          {
            label: exactTitle
          }
        ];
      }
      
      // Para rotas de configurações específicas, criamos a hierarquia
      if (pathname.includes('/configuracoes/')) {
        return [
          {
            label: 'Configurações',
            href: '/app/configuracoes'
          },
          {
            label: exactTitle
          }
        ];
      }
      
      // Para rotas de programas específicas, criamos a hierarquia
      if (pathname.includes('/programas/')) {
        return [
          {
            label: 'Programas',
            href: '/app/programas'
          },
          {
            label: exactTitle
          }
        ];
      }
      
      // Para outras rotas, retorna apenas o título
      return [{ label: exactTitle }];
    }

    // Lógica para rotas dinâmicas de programas
    if (pathname.startsWith('/app/programas/') && !pathname.includes('/sessoes/') && !pathname.includes('/relatorios/')) {
      const segments = pathname.split('/');
      const programaId = segments[3]; // '/app/programas/{programaId}'
      
      if (segments.length === 4) {
        // /app/programas/:programaId
        return [
          {
            label: 'Programas',
            href: '/app/programas'
          },
          {
            label: `Detalhe do Programa — ID: ${programaId}`
          }
        ];
      } else if (segments.length === 5 && segments[4] === 'editar') {
        // /app/programas/:programaId/editar
        return [
          {
            label: 'Programas',
            href: '/app/programas'
          },
          {
            label: `Editar Programa — ID: ${programaId}`
          }
        ];
      }
    }

    // Lógica para rotas dinâmicas de sessões
    if (pathname.includes('/programas/sessoes/') && pathname.split('/').length === 5) {
      const segments = pathname.split('/');
      const sessaoId = segments[4]; // '/app/programas/sessoes/{sessaoId}'
      
      return [
        {
          label: 'Programas',
          href: '/app/programas'
        },
        {
          label: `Sessão — ID: ${sessaoId}`
        }
      ];
    }

    // Fallback caso a rota não esteja no mapeamento
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 1) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      return [{ label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) }];
    }

    return [{ label: 'Dashboard' }];
  }, [location.pathname]);
}
