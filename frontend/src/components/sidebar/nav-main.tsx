import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { Actions, Subjects } from '@/features/auth/abilities/ability';
import { RequireAbility } from '@/features/auth/abilities/RequireAbility';
import { useArea } from '@/contexts/AreaContext';

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
        ability?: { action: Actions; subject: Subjects };
        items?: {
            title: string;
            url: string;
            ability?: { action: Actions; subject: Subjects };
            status?: 'em-breve' | 'quase-pronto';
        }[];
    }[];
}) {
    const location = useLocation();
    const { currentArea } = useArea();
    
    // Mapeamento de URLs das áreas para os tipos de área
    const areaUrlMap: Record<string, string> = {
        '/app/programas/fonoaudiologia': 'fonoaudiologia',
        '/app/programas/psicoterapia': 'psicoterapia',
        '/app/programas/terapia-aba': 'terapia-aba',
        '/app/programas/terapia-ocupacional': 'terapia-ocupacional',
        '/app/programas/fisioterapia': 'fisioterapia',
        '/app/programas/psicomotricidade': 'psicomotricidade',
        '/app/programas/educacao-fisica': 'educacao-fisica',
        '/app/programas/psicopedagogia': 'psicopedagogia',
        '/app/programas/musicoterapia': 'musicoterapia',
        '/app/programas/neuropsicologia': 'neuropsicologia',
    };
    
    // Função para verificar se a rota está ativa
    const isRouteActive = (itemUrl: string, subItems?: { url: string }[]) => {
        // Verifica se a rota atual corresponde exatamente ao item principal
        if (location.pathname === itemUrl) return true;
        
        // Para o Dashboard (/app), apenas ativa se estiver exatamente nessa rota
        if (itemUrl === '/app') {
            return location.pathname === '/app';
        }
        
        // Para subitens de Programas, verifica se a área atual corresponde
        // E se estamos realmente em uma página de programas (não em sessões ou outras páginas)
        if (subItems && itemUrl === '/app/programas') {
            // Verifica se estamos em uma rota de programas válida (hub ou subitem)
            const isOnProgramsRoute = location.pathname === '/app/programas' || 
                subItems.some(subItem => location.pathname.startsWith(subItem.url));
            
            if (!isOnProgramsRoute) return false;
            
            return subItems.some(subItem => {
                const areaFromUrl = areaUrlMap[subItem.url];
                return areaFromUrl === currentArea;
            });
        }
        
        // Verifica se alguma subrota está ativa
        if (subItems) {
            return subItems.some(subItem => location.pathname.startsWith(subItem.url));
        }
        
        return location.pathname.startsWith(itemUrl);
    };
    
    // Estado para controlar quais menus estão abertos - com persistência
    const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
        // Tenta recuperar do localStorage primeiro
        try {
            const saved = localStorage.getItem('sidebar-open-items');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Erro ao carregar estado da sidebar:', error);
        }

        // Se não houver estado salvo, inicializa todos fechados
        const initial: Record<string, boolean> = {};
        items.forEach((item) => {
            initial[item.title] = false;
        });
        return initial;
    });

    // Salva o estado no localStorage sempre que mudar
    useEffect(() => {
        try {
            localStorage.setItem('sidebar-open-items', JSON.stringify(openItems));
        } catch (error) {
            console.warn('Erro ao salvar estado da sidebar:', error);
        }
    }, [openItems]);

    const toggleItem = (title: string) => {
        setOpenItems((prev) => {
            // Se o item clicado já está aberto, apenas fecha ele
            if (prev[title]) {
                return {
                    ...prev,
                    [title]: false,
                };
            }
            
            // Se o item clicado está fechado, fecha todos os outros e abre apenas ele
            const newState: Record<string, boolean> = {};
            items.forEach((item) => {
                newState[item.title] = item.title === title;
            });
            return newState;
        });
    };

    const closeAllMenus = () => {
        setOpenItems(() => {
            const newState: Record<string, boolean> = {};
            items.forEach((item) => {
                newState[item.title] = false;
            });
            return newState;
        });
    };

    return (
        <SidebarGroup>
            
            <SidebarMenu className="gap-2">
                {items.map((item) => {
                    const isActive = isRouteActive(item.url, item.items);
                    
                    return (
                        <RequireAbility
                            key={item.title}
                            action={item.ability?.action ?? 'read'}
                            subject={item.ability?.subject ?? 'Dashboard'}
                        >
                            <Collapsible
                                key={item.title}
                                asChild
                                open={openItems[item.title] || false}
                                onOpenChange={() => toggleItem(item.title)}
                            >
                                <SidebarMenuItem>
                                    <SidebarMenuButton 
                                        asChild 
                                        tooltip={item.title} 
                                        isActive={isActive}
                                    >
                                        <Link 
                                            to={item.url}
                                            onClick={() => {
                                                // Se o item não tem subitens, fecha todos os menus
                                                if (!item.items?.length) {
                                                    closeAllMenus();
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary shrink-0">
                                                <item.icon className="h-4 w-4 text-background" />
                                            </div>
                                            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300 }}>
                                                {item.title}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                {item.items?.length ? (
                                    <>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                <ChevronRight />
                                                <span className="sr-only">Toggle</span>
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub className="gap-1.5 ml-3.5 border-l pl-3">
                                                {item.items?.map((subItem) => {
                                                    // Para programas, verifica a área atual
                                                    const areaFromUrl = areaUrlMap[subItem.url];
                                                    const isSubActive = areaFromUrl 
                                                        ? areaFromUrl === currentArea
                                                        : location.pathname.startsWith(subItem.url);
                                                    
                                                    return (
                                                        <RequireAbility
                                                            key={subItem.title}
                                                            action={subItem.ability?.action ?? 'read'}
                                                            subject={subItem.ability?.subject ?? 'Dashboard'}
                                                        >
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                                                    <Link to={subItem.url} className="flex items-center justify-between w-full">
                                                                        <span
                                                                            style={{
                                                                                fontFamily: 'Sora, sans-serif',
                                                                                fontWeight: 300,
                                                                            }}
                                                                        >
                                                                            {subItem.title}
                                                                        </span>
                                                                        {subItem.status === 'em-breve' && (
                                                                            <span 
                                                                                className="text-[10px] font-normal ml-0.5 px-2 py-0.5 shrink-0" 
                                                                                style={{ 
                                                                                    fontFamily: 'Inter, sans-serif', 
                                                                                    backgroundColor: '#FFF3E0', 
                                                                                    color: '#A57A5A',
                                                                                    borderRadius: '24px'
                                                                                }}
                                                                            >
                                                                                Em breve
                                                                            </span>
                                                                        )}
                                                                        {subItem.status === 'quase-pronto' && (
                                                                            <span 
                                                                                className="text-[10px] font-normal px-2 py-0.5 shrink-0" 
                                                                                style={{ 
                                                                                    fontFamily: 'Inter, sans-serif', 
                                                                                    backgroundColor: '#E3F2FD', 
                                                                                    color: '#4A6A8F',
                                                                                    borderRadius: '24px'
                                                                                }}
                                                                            >
                                                                                Quase pronto
                                                                            </span>
                                                                        )}
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        </RequireAbility>
                                                    );
                                                })}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </>
                                ) : null}
                            </SidebarMenuItem>
                        </Collapsible>
                    </RequireAbility>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
