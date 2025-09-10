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
      
      // Para outras rotas, retorna apenas o título
      return [{ label: exactTitle }];
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
