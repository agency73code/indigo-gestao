import { BadgeCheck, ChevronDown, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function NavUser() {
    const { logout, user, avatarVersion } = useAuth();
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const displayName = user?.name ?? '-';
    const displayRole = user?.perfil_acesso 
        ? user.perfil_acesso.charAt(0).toUpperCase() + user.perfil_acesso.slice(1).toLowerCase()
        : '-';
    const displayEmail = user?.email ?? '-';
    const initials = user?.name ? user.name
        .split(' ')
        .map((n) => n[0]?.toUpperCase() ?? '')
        .slice(0, 2)
        .join('') : '?';
    
    // Processar a URL do avatar corretamente
    const baseAvatarUrl = user?.avatar_url 
        ? (user.avatar_url.startsWith('/api') 
            ? `${import.meta.env.VITE_API_BASE ?? ''}${user.avatar_url}`
            : user.avatar_url)
        : undefined;
    
    // Adiciona avatarVersion para evitar cache quando foto é atualizada
    const avatarUrl = baseAvatarUrl 
        ? `${baseAvatarUrl}${baseAvatarUrl.includes('?') ? '&' : '?'}v=${avatarVersion}`
        : undefined;

    // Reset error state quando avatar URL ou versão muda
    useEffect(() => {
        if (baseAvatarUrl) {
            setImageError(false);
        }
    }, [baseAvatarUrl, avatarVersion]);

    const handleImageError = () => {
        setImageError(true);
    };

    // Se não tem URL ou deu erro, mostra fallback direto
    const shouldShowImage = avatarUrl && !imageError;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            tooltip={displayName}
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-full px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-10!"
                        >
                            <Avatar className="size-10 rounded-full shrink-0 group-data-[collapsible=icon]:size-8" key={avatarUrl}>
                                {shouldShowImage && (
                                    <AvatarImage 
                                        src={avatarUrl} 
                                        alt={displayName}
                                        onError={handleImageError}
                                        className="object-cover"
                                    />
                                )}
                                <AvatarFallback className="rounded-full" delayMs={0}>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-semibold">{displayName}</span>
                                <span className="truncate text-xs">{displayRole}</span>
                            </div>
                            <ChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side="bottom"
                        align="start"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-light">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="size-10 rounded-full" key={avatarUrl}>
                                    {shouldShowImage && (
                                        <AvatarImage 
                                            src={avatarUrl} 
                                            alt={displayName}
                                            onError={handleImageError}
                                            className="object-cover"
                                        />
                                    )}
                                    <AvatarFallback className="rounded-full" delayMs={0}>
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{displayName}</span>
                                    <span className="truncate text-xs">{displayEmail}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    navigate('/app/configuracoes');
                                }}
                            >
                                <BadgeCheck />
                                Configurações
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                logout();
                            }}
                        >
                            <LogOut />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
