import { SettingsCard } from '@/components/configuracoes/SettingsCard';
import { SwitchField } from '@/components/configuracoes/SwitchField';

interface NotificacoesSectionProps {
    notificacoes: {
        email: boolean;
        push: boolean;
        resumoSemanal: boolean;
        lembretes: boolean;
    };
    onNotificacaoChange: (key: string, value: boolean) => void;
}

export function NotificacoesSection({
    notificacoes,
    onNotificacaoChange,
}: NotificacoesSectionProps) {
    return (
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
                        onCheckedChange={(checked) => onNotificacaoChange('email', checked)}
                    />

                    <SwitchField
                        id="resumo-semanal"
                        label="Resumo Semanal"
                        description="Receba um resumo das atividades da semana"
                        checked={notificacoes.resumoSemanal}
                        onCheckedChange={(checked) => onNotificacaoChange('resumoSemanal', checked)}
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
                        onCheckedChange={(checked) => onNotificacaoChange('push', checked)}
                    />

                    <SwitchField
                        id="lembretes"
                        label="Lembretes de Consulta"
                        description="Notificações sobre consultas próximas"
                        checked={notificacoes.lembretes}
                        onCheckedChange={(checked) => onNotificacaoChange('lembretes', checked)}
                    />
                </div>
            </SettingsCard>
        </div>
    );
}
