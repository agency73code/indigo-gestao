import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const displayName = user?.name ?? '-';
    const displayEmail = user?.email ?? '-';
    const initials = user?.name ? user.name
        .split(' ')
        .map((n) => n[0]?.toUpperCase() ?? '')
        .slice(0, 2)
        .join('') : '?';
    
    // Processar a URL do avatar corretamente
    const avatarUrl = user?.avatar_url 
        ? (user.avatar_url.startsWith('/api') 
            ? `${import.meta.env.VITE_API_BASE ?? ''}${user.avatar_url}`
            : user.avatar_url)
        : undefined;

    // Reset loading state quando avatar URL muda
    useEffect(() => {
        if (avatarUrl) {
            setImageLoading(true);
            setImageError(false);
        }
    }, [avatarUrl]);

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
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
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-full" key={avatarUrl}>
                                {imageLoading && shouldShowImage && (
                                    <Skeleton className="h-8 w-8 rounded-full absolute inset-0" />
                                )}
                                {shouldShowImage && (
                                    <AvatarImage 
                                        src={avatarUrl} 
                                        alt={displayName}
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                        loading="eager"
                                        decoding="async"
                                        fetchPriority="high"
                                        className={imageLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}
                                    />
                                )}
                                <AvatarFallback className="rounded-full" delayMs={0}>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{displayName}</span>
                                <span className="truncate text-xs">{displayEmail}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side="bottom"
                        align="start"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-full" key={avatarUrl}>
                                    {imageLoading && shouldShowImage && (
                                        <Skeleton className="h-8 w-8 rounded-full absolute inset-0" />
                                    )}
                                    {shouldShowImage && (
                                        <AvatarImage 
                                            src={avatarUrl} 
                                            alt={displayName}
                                            onLoad={handleImageLoad}
                                            onError={handleImageError}
                                            loading="eager"
                                            decoding="async"
                                            fetchPriority="high"
                                            className={imageLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}
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
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
