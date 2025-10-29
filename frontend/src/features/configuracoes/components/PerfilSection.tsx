import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SettingsCard } from '@/components/configuracoes/SettingsCard';
import ProfilePhotoFieldSimple, { type ProfilePhotoFieldSimpleRef } from '@/components/profile/ProfilePhotoFieldSimple';
import { type ProfilePhotoDTO } from '@/hooks/useProfilePhoto';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { User, Building } from 'lucide-react';

export function PerfilSection() {
    const { user, updateAvatar } = useAuth();
    const [profilePhoto, setProfilePhoto] = useState<File | string | null>(user?.avatar_url || null);
    const profilePhotoRef = useRef<ProfilePhotoFieldSimpleRef>(null);
    const [showPhotoEditor, setShowPhotoEditor] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imageKey, setImageKey] = useState(0);
    const [optimisticAvatarUrl, setOptimisticAvatarUrl] = useState<string | null>(null);

    // Atualizar key quando avatar mudar para forçar reload
    useEffect(() => {
        setImageKey(prev => prev + 1);
        setOptimisticAvatarUrl(null); // Limpar preview otimista
    }, [user?.avatar_url]);

    const handlePhotoChange = useCallback((file: File | null) => {
        setProfilePhoto(file);
        
        // Optimistic UI: Mostrar preview imediatamente
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setOptimisticAvatarUrl(previewUrl);
        } else {
            setOptimisticAvatarUrl(null);
        }
    }, []);

    const handlePhotoUploaded = useCallback((dto: ProfilePhotoDTO) => {
        // A URL do avatar deve ser no formato /api/arquivos/{storageId}/view
        const newAvatarUrl = `/api/arquivos/${dto.fileId}/view`;
        
        setProfilePhoto(newAvatarUrl);
        
        // Atualizar o avatar no contexto de autenticação para refletir em toda a aplicação
        updateAvatar(newAvatarUrl);
        
        setShowPhotoEditor(false);
        setOptimisticAvatarUrl(null);
    }, [updateAvatar]);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            // Fazer upload da foto se houver uma nova
            if (profilePhoto && typeof profilePhoto !== 'string') {
                await profilePhotoRef.current?.uploadPhoto();
            }
            // Aqui você pode adicionar a lógica para salvar outros dados do perfil
            setShowPhotoEditor(false);
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setIsSaving(false);
        }
    }, [profilePhoto]);

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <SettingsCard
                title="Informações Pessoais"
                description="Seus dados básicos na plataforma"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        {showPhotoEditor ? (
                            <div className="space-y-2">
                                <ProfilePhotoFieldSimple
                                    ref={profilePhotoRef}
                                    userId={user?.id || ''}
                                    value={profilePhoto}
                                    onChange={handlePhotoChange}
                                    onUploaded={handlePhotoUploaded}
                                />
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setShowPhotoEditor(false)}
                                        disabled={isSaving}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 rounded-full" key={imageKey}>
                                    <AvatarImage 
                                        src={optimisticAvatarUrl || user?.avatar_url || "/placeholder-avatar.jpg"}
                                        loading="eager"
                                        decoding="async"
                                        fetchPriority="high"
                                    />
                                    <AvatarFallback delayMs={0}>
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
