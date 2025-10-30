import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SettingsCard } from '@/components/configuracoes/SettingsCard';
import ProfilePhotoFieldSimple from '@/components/profile/ProfilePhotoFieldSimple';
import { type ProfilePhotoDTO } from '@/hooks/useProfilePhoto';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { User, Building } from 'lucide-react';

export function PerfilSection() {
    const { user } = useAuth();
    const [profilePhoto, setProfilePhoto] = useState<File | string | null>(user?.avatar_url || null);
    const [showPhotoEditor, setShowPhotoEditor] = useState(false);
    const [userData, setUserData] = useState<{ nome: string; dataNascimento: string } | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const url = `/api/usuarios/${user.id}`;

        fetch(url, { credentials: 'include' })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Erro HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setUserData({
                    nome: data.nome,
                    dataNascimento: data.dataNascimento,
                });
            })
            .catch((err) =>
                console.error('Erro ao carregar dados do usuário:', err)
            );
    }, [user]);

    const handlePhotoChange = useCallback((file: File | null) => {
        setProfilePhoto(file);
    }, []);

    const handlePhotoUploaded = useCallback((dto: ProfilePhotoDTO) => {
        // Atualizar com a URL do backend quando o upload for bem-sucedido
        setProfilePhoto(dto.webViewLink || dto.thumbnailLink);
        setShowPhotoEditor(false);
    }, []);

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <SettingsCard
                title="Informações Pessoais"
                description="Seus dados básicos na plataforma"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        {showPhotoEditor && userData ? (
                            <div className="space-y-2">
                                <ProfilePhotoFieldSimple
                                    userId={user?.id || ''}
                                    fullName={userData.nome}
                                    birthDate={userData.dataNascimento}
                                    value={profilePhoto}
                                    onChange={handlePhotoChange}
                                    onUploaded={handlePhotoUploaded}
                                />
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setShowPhotoEditor(false)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 rounded-[5px]">
                                    <AvatarImage src={user?.avatar_url || "/placeholder-avatar.jpg"} />
                                    <AvatarFallback>
                                        <User className="h-8 w-8" />
                                    </AvatarFallback>
                                </Avatar>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowPhotoEditor(true)}
                                >
                                    Alterar Foto de Perfil
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                            id="nome"
                            placeholder="Seu nome completo"
                            defaultValue={user?.name || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            defaultValue={user?.email || ""}
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
