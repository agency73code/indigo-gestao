import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
}) {
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
            <SidebarGroupLabel style={{ fontFamily: 'Sora, sans-serif' }}>
                Platform
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible
                        key={item.title}
                        asChild
                        open={openItems[item.title] || false}
                        onOpenChange={() => toggleItem(item.title)}
                    >
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip={item.title}>
                                <Link to={item.url}>
                                    <item.icon />
                                    <span style={{ fontFamily: 'Sora, sans-serif' }}>
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
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild>
                                                        <Link to={subItem.url}>
                                                            <span
                                                                style={{
                                                                    fontFamily: 'Sora, sans-serif',
                                                                }}
                                                            >
                                                                {subItem.title}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </>
                            ) : null}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
