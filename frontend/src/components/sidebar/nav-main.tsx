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
        }[];
    }[];
}) {
    const location = useLocation();
    
    // Função para verificar se a rota está ativa
    const isRouteActive = (itemUrl: string, subItems?: { url: string }[]) => {
        // Verifica se a rota atual corresponde ao item principal
        if (location.pathname === itemUrl) return true;
        
        // Verifica se alguma subrota está ativa
        if (subItems) {
            return subItems.some(subItem => location.pathname.startsWith(subItem.url));
        }
        
        // Para rotas que têm caminhos filhos (ex: /app/programas)
        return location.pathname.startsWith(itemUrl) && itemUrl !== '/';
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
        setOpenItems((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
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
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                                        <Link to={item.url}>
                                            <item.icon />
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
                                                    const isSubActive = location.pathname.startsWith(subItem.url);
                                                    
                                                    return (
                                                        <RequireAbility
                                                            key={subItem.title}
                                                            action={subItem.ability?.action ?? 'read'}
                                                            subject={subItem.ability?.subject ?? 'Dashboard'}
                                                        >
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                                                    <Link to={subItem.url}>
                                                                        <span
                                                                            style={{
                                                                                fontFamily: 'Sora, sans-serif',
                                                                                fontWeight: 300,
                                                                            }}
                                                                        >
                                                                            {subItem.title}
                                                                        </span>
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
