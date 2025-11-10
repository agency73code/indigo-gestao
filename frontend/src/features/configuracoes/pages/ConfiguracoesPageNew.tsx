import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/configuracoes/SectionHeader';
import { Settings, User, Bell, Shield, Zap } from 'lucide-react';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import {
    PerfilSection,
    PreferenciasSection,
    NotificacoesSection,
    SegurancaSection,
    IntegracoesSection,
} from '../components';

export default function ConfiguracoesPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Configurações');
    }, [setPageTitle]);

    // Determinar tab ativa baseada na URL
    const getActiveTabFromPath = () => {
        const path = location.pathname;
        if (path.includes('/perfil')) return 'perfil';
        if (path.includes('/preferencias')) return 'preferencias';
        if (path.includes('/notificacoes')) return 'notificacoes';
        if (path.includes('/seguranca')) return 'seguranca';
        if (path.includes('/integracoes')) return 'integracoes';
        return 'perfil'; // default
    };

    const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

    // Estados para demonstração (sem lógica de salvamento)
    const [notificacoes, setNotificacoes] = useState({
        email: true,
        push: false,
        resumoSemanal: true,
        lembretes: true,
    });

    // Atualizar tab quando a URL mudar
    useEffect(() => {
        setActiveTab(getActiveTabFromPath());
    }, [location.pathname]);

    // Navegar quando a tab mudar
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === 'perfil') {
            navigate('/app/configuracoes');
        } else {
            navigate(`/app/configuracoes/${value}`);
        }
    };

    const handleNotificacaoChange = (key: string, value: boolean) => {
        setNotificacoes((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // Placeholder - não implementar lógica real
        alert('Funcionalidade de salvamento será implementada');
    };

    const handleCancel = () => {
        // Placeholder - não implementar lógica real
        alert('Alterações canceladas');
    };

    return (
        <div className="container mx-auto py-6 px-4 max-w-6xl">

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
                    <TabsTrigger value="perfil" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">Perfil</span>
                    </TabsTrigger>
                    <TabsTrigger value="preferencias" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Preferências</span>
                    </TabsTrigger>
                    <TabsTrigger value="notificacoes" className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        <span className="hidden sm:inline">Notificações</span>
                    </TabsTrigger>
                    <TabsTrigger value="seguranca" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">Segurança</span>
                    </TabsTrigger>
                    <TabsTrigger value="integracoes" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span className="hidden sm:inline">Integrações</span>
                    </TabsTrigger>
                </TabsList>

                {/* Conteúdo das Tabs */}

                {/* Perfil & Organização */}
                <TabsContent value="perfil" className="space-y-6">
                    <SectionHeader
                        title="Perfil & Organização"
                        description="Gerencie suas informações pessoais e da organização"
                    />
                    <PerfilSection />
                </TabsContent>

                {/* Preferências */}
                <TabsContent value="preferencias" className="space-y-6">
                    <SectionHeader
                        title="Preferências"
                        description="Configure suas preferências de visualização e formato"
                    />
                    <PreferenciasSection />
                </TabsContent>

                {/* Notificações */}
                <TabsContent value="notificacoes" className="space-y-6">
                    <SectionHeader
                        title="Notificações"
                        description="Configure como e quando você quer ser notificado"
                    />
                    <NotificacoesSection
                        notificacoes={notificacoes}
                        onNotificacaoChange={handleNotificacaoChange}
                    />
                </TabsContent>

                {/* Segurança */}
                <TabsContent value="seguranca" className="space-y-6">
                    <SectionHeader
                        title="Segurança"
                        description="Gerencie sua senha e configurações de segurança"
                    />
                    <SegurancaSection />
                </TabsContent>

                {/* Integrações */}
                <TabsContent value="integracoes" className="space-y-6">
                    <SectionHeader
                        title="Integrações"
                        description="Conecte sua conta com outros serviços"
                    />
                    <IntegracoesSection />
                </TabsContent>
            </Tabs>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t">
                <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                </Button>
                <Button onClick={handleSave}>Salvar Alterações</Button>
            </div>
        </div>
    );
}
