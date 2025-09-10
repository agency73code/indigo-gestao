import { Button } from '@/components/ui/button';
import { SettingsCard } from '@/components/configuracoes/SettingsCard';

export function IntegracoesSection() {
    return (
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

            <SettingsCard title="WhatsApp Business" description="Envie lembretes via WhatsApp">
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
    );
}
