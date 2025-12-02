import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { SettingsSidebar, type SettingsSection } from '../components/SettingsSidebar';
import { AccountSettings } from '../components/AccountSettings';
import { SecuritySettings } from '../components/SecuritySettings';
import { AppearanceSettings } from '../components/AppearanceSettings';

export default function ConfiguracoesPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setPageTitle, setNoMainContainer } = usePageTitle();
    const { logout } = useAuth();

    useEffect(() => {
        setPageTitle('Configurações');
        setNoMainContainer(true);
        
        return () => {
            setNoMainContainer(false);
        };
    }, []);

    // Determinar seção ativa baseada na URL
    const getSectionFromPath = (): SettingsSection => {
        const path = location.pathname;
        if (path.includes('/seguranca')) return 'seguranca';
        if (path.includes('/aparencia')) return 'aparencia';
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
            case 'seguranca':
                return <SecuritySettings />;
            case 'aparencia':
                return <AppearanceSettings />;
            default:
                return <AccountSettings />;
        }
    };

    return (
        <div className="flex h-full gap-1">
            {/* Sidebar de Configurações - Card Separado */}
            <div 
                className="w-[284px] shrink-0"
                style={{ 
                    backgroundColor: 'var(--header-bg)',
                    borderRadius: '16px'
                }}
            >
                <SettingsSidebar
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                    onLogout={handleLogout}
                />
            </div>

            {/* Card Principal com Conteúdo */}
            <div 
                className="flex-1 flex flex-col min-w-0 overflow-hidden"
                style={{ 
                    backgroundColor: 'var(--header-bg)',
                    borderRadius: '16px'
                }}
            >
                {renderContent()}
            </div>
        </div>
    );
}
