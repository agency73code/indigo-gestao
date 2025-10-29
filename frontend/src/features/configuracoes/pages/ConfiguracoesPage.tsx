import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SectionHeader } from '@/components/configuracoes/SectionHeader';
import { SettingsCard } from '@/components/configuracoes/SettingsCard';
import { SwitchField } from '@/components/configuracoes/SwitchField';
import { PerfilSection } from '@/features/configuracoes/components/PerfilSection';
import { Settings, User, Bell, Shield, Zap, X, Check } from 'lucide-react';

export default function ConfiguracoesPage() {
    const location = useLocation();
    const navigate = useNavigate();

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

    // Estados para demonstração (sem lógica de salvamento)
    const [notificacoes, setNotificacoes] = useState({
        email: true,
        push: false,
        resumoSemanal: true,
        lembretes: true,
    });

    const handleSave = () => {
        // Placeholder - não implementar lógica real
        alert('Funcionalidade de salvamento será implementada');
    };

    const handleCancel = () => {
        // Placeholder - não implementar lógica real
        alert('Alterações canceladas');
    };

    return (
        <div className="flex flex-col top-0 left-0 w-full h-full px-4 py-4">
            {/* Header */}
            <div className="mb-4">
                <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-primary" />
                    <h1
                        style={{ fontFamily: 'sora' }}
                        className="text-2xl font-semibold text-primary"
                    >
                        Configurações
                    </h1>
                </div>
                
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-4">
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

                    <div className="grid gap-6 md:grid-cols-2">
                        <SettingsCard
                            title="Localização"
                            description="Idioma, fuso horário e formatos regionais"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="idioma">Idioma</Label>
                                    <Select defaultValue="pt-br">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o idioma" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pt-br">
                                                Português (Brasil)
                                            </SelectItem>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Español</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fuso">Fuso Horário</Label>
                                    <Select defaultValue="america-sao-paulo">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o fuso horário" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="america-sao-paulo">
                                                América/São_Paulo (UTC-3)
                                            </SelectItem>
                                            <SelectItem value="america-new-york">
                                                América/New_York (UTC-5)
                                            </SelectItem>
                                            <SelectItem value="europe-london">
                                                Europa/Londres (UTC+0)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </SettingsCard>

                        <SettingsCard
                            title="Formatação"
                            description="Como datas, horas e números são exibidos"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="formato-data">Formato de Data</Label>
                                    <Select defaultValue="dd-mm-yyyy">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Formato de data" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dd-mm-yyyy">DD/MM/AAAA</SelectItem>
                                            <SelectItem value="mm-dd-yyyy">MM/DD/AAAA</SelectItem>
                                            <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="formato-hora">Formato de Hora</Label>
                                    <Select defaultValue="24h">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Formato de hora" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="24h">24 horas (14:30)</SelectItem>
                                            <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </SettingsCard>
                    </div>
                </TabsContent>

                {/* Notificações */}
                <TabsContent value="notificacoes" className="space-y-6">
                    <SectionHeader
                        title="Notificações"
                        description="Configure como e quando você quer ser notificado"
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                        <SettingsCard
                            title="Notificações por E-mail"
                            description="Receba atualizações importantes por e-mail"
                        >
                            <div className="space-y-4">
                                <SwitchField
                                    id="email-geral"
                                    label="Notificações por E-mail"
                                    description="Ativar/desativar todas as notificações por e-mail"
                                    checked={notificacoes.email}
                                    onCheckedChange={(checked) =>
                                        setNotificacoes((prev) => ({ ...prev, email: checked }))
                                    }
                                />

                                <SwitchField
                                    id="resumo-semanal"
                                    label="Resumo Semanal"
                                    description="Receba um resumo das atividades da semana"
                                    checked={notificacoes.resumoSemanal}
                                    onCheckedChange={(checked) =>
                                        setNotificacoes((prev) => ({
                                            ...prev,
                                            resumoSemanal: checked,
                                        }))
                                    }
                                />
                            </div>
                        </SettingsCard>

                        <SettingsCard
                            title="Notificações Push"
                            description="Notificações em tempo real no navegador"
                        >
                            <div className="space-y-4">
                                <SwitchField
                                    id="push-geral"
                                    label="Notificações Push"
                                    description="Ativar notificações push no navegador"
                                    checked={notificacoes.push}
                                    onCheckedChange={(checked) =>
                                        setNotificacoes((prev) => ({ ...prev, push: checked }))
                                    }
                                />

                                <SwitchField
                                    id="lembretes"
                                    label="Lembretes de Consulta"
                                    description="Notificações sobre consultas próximas"
                                    checked={notificacoes.lembretes}
                                    onCheckedChange={(checked) =>
                                        setNotificacoes((prev) => ({ ...prev, lembretes: checked }))
                                    }
                                />
                            </div>
                        </SettingsCard>
                    </div>
                </TabsContent>

                {/* Segurança */}
                <TabsContent value="seguranca" className="space-y-6">
                    <SectionHeader
                        title="Segurança"
                        description="Gerencie sua senha e configurações de segurança"
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                        <SettingsCard title="Senha" description="Altere sua senha de acesso">
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-[5px] border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        ✓ Sua senha foi alterada há 15 dias
                                    </p>
                                </div>

                                <Button className="w-full" variant="outline">
                                    Alterar Senha
                                </Button>
                            </div>
                        </SettingsCard>

                        <SettingsCard
                            title="Autenticação em Duas Etapas"
                            description="Adicione uma camada extra de segurança"
                        >
                            <div className="space-y-4">
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        ⚠️ Autenticação em duas etapas não configurada
                                    </p>
                                </div>

                                <Button className="w-full">Configurar 2FA</Button>
                            </div>
                        </SettingsCard>
                    </div>
                </TabsContent>

                {/* Integrações */}
                <TabsContent value="integracoes" className="space-y-6">
                    <SectionHeader
                        title="Integrações"
                        description="Conecte sua conta com outros serviços"
                    />

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <SettingsCard
                            title="Google Calendar"
                            description="Sincronize consultas com seu calendário"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    <span className="text-sm text-red-600">Desconectado</span>
                                </div>
                                <Button size="sm" className="w-full">
                                    Conectar
                                </Button>
                            </div>
                        </SettingsCard>

                        <SettingsCard
                            title="WhatsApp Business"
                            description="Envie lembretes via WhatsApp"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    <span className="text-sm text-green-600">Conectado</span>
                                </div>
                                <Button size="sm" variant="outline" className="w-full">
                                    Configurar
                                </Button>
                            </div>
                        </SettingsCard>

                        <SettingsCard title="Zoom" description="Realize consultas online">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    <span className="text-sm text-red-600">Desconectado</span>
                                </div>
                                <Button size="sm" className="w-full">
                                    Conectar
                                </Button>
                            </div>
                        </SettingsCard>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t">
                <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Cancelar
                </Button>
                <Button onClick={handleSave} className="">
                    <Check className="w-4 h-4" />
                    Salvar Alterações
                </Button>
            </div>
        </div>
    );
}
