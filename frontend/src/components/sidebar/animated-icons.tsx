/**
 * Wrapper para ícones animados da biblioteca animateicons
 * Adapta os ícones animados para funcionar como ícones Lucide na sidebar
 */

import type { ComponentType, RefObject } from 'react';
import type { HTMLMotionProps } from 'motion/react';
import { DashboardIcon, type DashboardIconHandle } from '@/components/DashboardIcon';
import { UserRoundSearchIcon, type UserRoundSearchHandle } from '@/components/UserRoundSearchIcon';
import { UserPlusIcon, type UserPlusHandle } from '@/components/UserPlusIcon';
import { ClipboardIcon, type ClipboardIconHandle } from '@/components/ClipboardIcon';
import { ActivityIcon, type ActivityIconHandle } from '@/components/ActivityIcon';
import { BookOpenTextIcon, type BookOpenTextIconHandle } from '@/components/BookOpenTextIcon';
import { BookOpenIcon, type BookOpenIconHandle } from '@/components/BookOpenIcon';
import { WalletIcon, type WalletHandle } from '@/components/WalletIcon';
import { SettingsIcon, type SettingsIconHandle } from '@/components/SettingsIcon';
import { HeadsetIcon, type HeadsetIconHandle } from '@/components/HeadsetIcon';
import { SendIcon, type SendIconHandle } from '@/components/SendIcon';
import { GlobeIcon, type GlobeIconHandle } from '@/components/GlobeIcon';

// Tipo genérico para ícones animados
export interface AnimatedIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

export interface AnimatedIconProps extends HTMLMotionProps<'div'> {
    size?: number;
    duration?: number;
    isAnimated?: boolean;
}

// União de todos os tipos de handles
type AnyIconHandle = 
    | DashboardIconHandle 
    | UserRoundSearchHandle 
    | UserPlusHandle 
    | ClipboardIconHandle
    | ActivityIconHandle
    | BookOpenTextIconHandle
    | BookOpenIconHandle
    | WalletHandle
    | SettingsIconHandle
    | HeadsetIconHandle
    | SendIconHandle
    | GlobeIconHandle;

// Tipo para componentes de ícone animado
export type AnimatedIconComponent = ComponentType<
    AnimatedIconProps & { ref?: RefObject<AnyIconHandle | null> }
>;

// Exporta os ícones animados para uso na sidebar
export const AnimatedIcons = {
    Dashboard: DashboardIcon as AnimatedIconComponent,
    UserRoundSearch: UserRoundSearchIcon as AnimatedIconComponent,
    UserPlus: UserPlusIcon as AnimatedIconComponent,
    Clipboard: ClipboardIcon as AnimatedIconComponent,
    Activity: ActivityIcon as AnimatedIconComponent,
    BookOpenText: BookOpenTextIcon as AnimatedIconComponent,
    BookOpen: BookOpenIcon as AnimatedIconComponent,
    Wallet: WalletIcon as AnimatedIconComponent,
    Settings: SettingsIcon as AnimatedIconComponent,
    Headset: HeadsetIcon as AnimatedIconComponent,
    Send: SendIcon as AnimatedIconComponent,
    Globe: GlobeIcon as AnimatedIconComponent,
};

export {
    DashboardIcon,
    UserRoundSearchIcon,
    UserPlusIcon,
    ClipboardIcon,
    ActivityIcon,
    BookOpenTextIcon,
    BookOpenIcon,
    WalletIcon,
    SettingsIcon,
    HeadsetIcon,
    SendIcon,
    GlobeIcon,
};
