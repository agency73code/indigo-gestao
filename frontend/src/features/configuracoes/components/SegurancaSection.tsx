import { Button } from '@/components/ui/button';
import { SettingsCard } from '@/components/configuracoes/SettingsCard';

export function SegurancaSection() {
    return (
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
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-[5px] border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⚠️ Autenticação em duas etapas não configurada
                        </p>
                    </div>

                    <Button className="w-full">Configurar 2FA</Button>
                </div>
            </SettingsCard>
        </div>
    );
}
