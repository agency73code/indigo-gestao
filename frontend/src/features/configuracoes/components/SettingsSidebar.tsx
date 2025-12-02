import { useState } from 'react';
import { User, Shield, Palette, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import ToolbarConsulta from '@/features/consultas/components/ToolbarConsulta';

export type SettingsSection =
    | 'conta'
    | 'seguranca'
    | 'aparencia';

interface MenuItem {
    id: SettingsSection;
    label: string;
    icon: React.ElementType;
}

interface SettingsSidebarProps {
    activeSection: SettingsSection;
    onSectionChange: (section: SettingsSection) => void;
    onLogout?: () => void;
}

const personalSettings: MenuItem[] = [
    { id: 'conta', label: 'Conta', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
];

export function SettingsSidebar({
    activeSection,
    onSectionChange,
    onLogout,
}: SettingsSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filtrar itens com base na busca
    const filterItems = (items: MenuItem[]) => {
        if (!searchQuery.trim()) return items;
        return items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredPersonal = filterItems(personalSettings);

    const renderMenuItem = (item: MenuItem) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;

        return (
            <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                    'w-full flex items-center gap-3 px-1 py-1 rounded-full text-sm transition-all duration-200 ease-out',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground translate-x-2'
                )}
                style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300 }}
            >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary shrink-0">
                    <Icon className="h-4 w-4 text-background" />
                </div>
                <span>{item.label}</span>
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Campo de busca */}
            <div className="p-4">
                <ToolbarConsulta
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder="Search"
                    showFilters={false}
                />
            </div>

            {/* Área de scroll com os menus */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
                {/* Configurações pessoais */}
                {filteredPersonal.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                            Configurações pessoais
                        </p>
                        {filteredPersonal.map(renderMenuItem)}
                    </div>
                )}
            </div>

            {/* Botão de logout fixo no rodapé */}
            <div className="pl-2 pr-2 py-2">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 ease-out bg-sidebar-accent hover:bg-sidebar-accent/80"
                    style={{ fontFamily: 'Sora, sans-serif', fontWeight: 300 }}
                >
                    <span>Sair</span>
                    <LogOut className="h-4 w-4 shrink-0" />
                </button>
            </div>
        </div>
    );
}
