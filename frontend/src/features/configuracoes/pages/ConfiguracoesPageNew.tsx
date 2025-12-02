import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { SettingsSidebar, type SettingsSection } from '../components/SettingsSidebar';
import { AccountSettings } from '../components/AccountSettings';
import { NotificationsSettings } from '../components/NotificationsSettings';
import { SecuritySettings } from '../components/SecuritySettings';
import { AppearanceSettings } from '../components/AppearanceSettings';
import { IntegrationsSettings } from '../components/IntegrationsSettings';
import { BillingSettings } from '../components/BillingSettings';

export default function ConfiguracoesPageNew() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setPageTitle } = usePageTitle();
    const { logout } = useAuth();

    useEffect(() => {
        setPageTitle('Configurações');
    }, [setPageTitle]);

    // Determinar seção ativa baseada na URL
    const getSectionFromPath = (): SettingsSection => {
        const path = location.pathname;
        if (path.includes('/notificacoes')) return 'notificacoes';
        if (path.includes('/seguranca')) return 'seguranca';
        if (path.includes('/aparencia')) return 'aparencia';
        if (path.includes('/integracoes')) return 'integracoes';
        if (path.includes('/faturamento')) return 'faturamento';
        return 'conta'; // default
    };

    const [activeSection, setActiveSection] = useState<SettingsSection>(getSectionFromPath());

    // Atualizar seção quando a URL mudar
    useEffect(() => {
        setActiveSection(getSectionFromPath());
    }, [location.pathname]);

    // Navegar quando a seção mudar
    const handleSectionChange = (section: SettingsSection) => {
        setActiveSection(section);
        if (section === 'conta') {
            navigate('/app/configuracoes');
        } else {
            navigate(`/app/configuracoes/${section}`);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    // Renderizar o conteúdo correto baseado na seção ativa
    const renderContent = () => {
        switch (activeSection) {
            case 'conta':
                return <AccountSettings />;
            case 'notificacoes':
                return <NotificationsSettings />;
            case 'seguranca':
                return <SecuritySettings />;
            case 'aparencia':
                return <AppearanceSettings />;
            case 'integracoes':
                return <IntegrationsSettings />;
            case 'faturamento':
                return <BillingSettings />;
            default:
                return <AccountSettings />;
        }
    };

    return (
        <div className="flex flex-col h-full w-full p-4">
            {/* Card principal com layout bipartido */}
            <div className="flex flex-1 min-h-0 bg-card rounded-lg border shadow-sm overflow-hidden">
                {/* Sidebar interna de configurações */}
                <div className="w-72 shrink-0 border-r bg-muted/10">
                    <SettingsSidebar
                        activeSection={activeSection}
                        onSectionChange={handleSectionChange}
                        onLogout={handleLogout}
                    />
                </div>

                {/* Conteúdo da seção selecionada */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
