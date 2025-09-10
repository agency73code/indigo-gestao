import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SettingsCard } from '@/components/configuracoes/SettingsCard';
import { User, Building } from 'lucide-react';

export function PerfilSection() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <SettingsCard
                title="Informações Pessoais"
                description="Seus dados básicos na plataforma"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-[5px]">
                            <AvatarImage src="/placeholder-avatar.jpg" />
                            <AvatarFallback>
                                <User className="h-8 w-8" />
                            </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">
                            Alterar Avatar
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                            id="nome"
                            placeholder="Seu nome completo"
                            defaultValue="João Silva"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            defaultValue="joao@indigo.com"
                        />
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="Organização" description="Informações da sua organização">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-[5px] flex items-center justify-center">
                            <Building className="h-8 w-8 text-primary" />
                        </div>
                        <Button variant="outline" size="sm">
                            Alterar Logo
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="organizacao">Nome da Organização</Label>
                        <Input
                            id="organizacao"
                            placeholder="Nome da sua organização"
                            defaultValue="Clínica Índigo"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                            id="cnpj"
                            placeholder="00.000.000/0000-00"
                            defaultValue="12.345.678/0001-90"
                        />
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
}
