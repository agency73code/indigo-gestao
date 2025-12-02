import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfilePhotoFieldSimple, { type ProfilePhotoFieldSimpleRef } from '@/components/profile/ProfilePhotoFieldSimple';
import { type ProfilePhotoDTO } from '@/hooks/useProfilePhoto';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { User, Upload, Trash2 } from 'lucide-react';
import { SettingsContent } from './SettingsContent';
import { toast } from 'sonner';

export function AccountSettings() {
    const { user, updateAvatar } = useAuth();
    const [profilePhoto, setProfilePhoto] = useState<File | string | null>(user?.avatar_url || null);
    const profilePhotoRef = useRef<ProfilePhotoFieldSimpleRef>(null);
    const [showPhotoEditor, setShowPhotoEditor] = useState(false);
    const [userData, setUserData] = useState<{ nome: string; dataNascimento: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageKey, setImageKey] = useState(0);
    const [optimisticAvatarUrl, setOptimisticAvatarUrl] = useState<string | null>(null);

    // Atualizar key quando avatar mudar para forçar reload
    useEffect(() => {
        setImageKey(prev => prev + 1);
        setOptimisticAvatarUrl(null);
    }, [user?.avatar_url]);

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

        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setOptimisticAvatarUrl(previewUrl);
        } else {
            setOptimisticAvatarUrl(null);
        }
    }, []);

    const handlePhotoUploaded = useCallback((dto: ProfilePhotoDTO) => {
        const encodedId = encodeURIComponent(dto.fileId);
        const newAvatarUrl = `/api/arquivos/${encodedId}/view`;

        setProfilePhoto(newAvatarUrl);
        updateAvatar(newAvatarUrl);

        setOptimisticAvatarUrl(null);
        setShowPhotoEditor(false);
    }, [updateAvatar]);

    const handleDeletePhoto = useCallback(async () => {
        if (!user?.avatar_url) {
            toast.error('Não há foto para remover');
            return;
        }

        // Extrair o ID do arquivo da URL do avatar
        // URL format: /api/arquivos/{id}/view
        const match = user.avatar_url.match(/\/api\/arquivos\/([^/]+)\/view/);
        if (!match) {
            toast.error('Não foi possível identificar a foto');
            return;
        }

        const fileId = decodeURIComponent(match[1]);

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/arquivos/${encodeURIComponent(fileId)}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Erro ao remover foto');
            }

            setProfilePhoto(null);
            setOptimisticAvatarUrl(null);
            updateAvatar('');
            toast.success('Foto removida com sucesso');
        } catch (error) {
            console.error('Erro ao deletar foto:', error);
            toast.error('Erro ao remover foto');
        } finally {
            setIsDeleting(false);
        }
    }, [user?.avatar_url, updateAvatar]);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            if (profilePhoto && typeof profilePhoto !== 'string') {
                await profilePhotoRef.current?.uploadPhoto();
            }
            // TODO: Salvar outros dados quando o backend estiver pronto
            setShowPhotoEditor(false);
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setIsSaving(false);
        }
    }, [profilePhoto]);

    const handleCancel = () => {
        // Resetar alterações
        setShowPhotoEditor(false);
    };

    const footerActions = (
        <div className="flex justify-end gap-3">
            <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
            >
                Cancelar
            </Button>
            <Button
                onClick={handleSave}
                disabled={isSaving}
            >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
        </div>
    );

    return (
        <SettingsContent
            footer={footerActions}
        >
            <div className="space-y-8">
                {/* Bloco 1: Foto de Perfil */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-[312px] shrink-0">
                        <h3 className="text-sm font-medium text-foreground">Foto de Perfil</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Use uma foto clara para o seu perfil
                        </p>
                    </div>
                    <div className="flex-1">
                        <div className="bg-background rounded-lg p-6">
                            {showPhotoEditor && userData ? (
                                <div className="space-y-4">
                                    <ProfilePhotoFieldSimple
                                        ref={profilePhotoRef}
                                        userId={user?.id || ''}
                                        fullName={userData.nome}
                                        birthDate={userData.dataNascimento}
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
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <Avatar className="h-32 w-32 rounded-full" key={imageKey}>
                                        <AvatarImage
                                            src={optimisticAvatarUrl || user?.avatar_url || "/placeholder-avatar.jpg"}
                                            loading="eager"
                                            decoding="async"
                                            fetchPriority="high"
                                        />
                                        <AvatarFallback delayMs={0}>
                                            <User className="h-12 w-12" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => setShowPhotoEditor(true)}
                                            className="gap-2"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Alterar Foto
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="gap-2 rounded-full"
                                            onClick={handleDeletePhoto}
                                            disabled={isDeleting || !user?.avatar_url}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SettingsContent>
    );
}
