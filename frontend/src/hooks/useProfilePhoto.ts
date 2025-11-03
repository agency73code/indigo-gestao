import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { createFileFromBlob } from '@/utils/image';

export interface ProfilePhotoDTO {
  fileId: string;
  webViewLink: string;
  thumbnailLink: string;
}

export interface UseProfilePhotoReturn {
  isUploading: boolean;
  uploadError: string | null;
  uploadProfilePhoto: (
    croppedBlob: Blob,
    userId: string,
    fullName: string,
    birthDate: string
  ) => Promise<ProfilePhotoDTO | null>;
  clearError: () => void;
}

/**
 * Hook para gerenciar upload de foto de perfil
 * Prepara os dados para enviar ao endpoint POST /api/profile-photo
 */
export const useProfilePhoto = (): UseProfilePhotoReturn => {
  const location = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  const uploadProfilePhoto = useCallback(async (
    croppedBlob: Blob,
    userId: string,
    fullName: string,
    birthDate: string
  ): Promise<ProfilePhotoDTO | null> => {

    // Quando não existir userId(cadastro) só sai
    if (!userId) {
      return null;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Criar arquivo WebP com nome padronizado
      const fileName = `profile-photo.webp`;
      const file = createFileFromBlob(croppedBlob, fileName);
      
      const isTerapeuta = location.pathname.includes('/app/consultar/terapeutas') || location.pathname.includes('/app/configuracoes');
      const ownerType = isTerapeuta ? 'terapeuta' : 'cliente';
      const url = `/api/arquivos?ownerType=${ownerType}&ownerId=${userId}`;

      // Criar FormData para enviar ao backend
      const formData = new FormData();
      formData.append('fotoPerfil', file);
      formData.append('ownerType', ownerType);
      formData.append('ownerId', userId);
      formData.append('fullName', fullName);
      formData.append('birthDate', birthDate);

      // Fazer upload para o endpoint do backend
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error('Arquivo inválido. Use JPG, PNG ou WebP.');
          case 413:
            throw new Error('Arquivo muito grande. Máximo 5MB.');
          case 415:
            throw new Error('Tipo de arquivo não suportado.');
          default:
            throw new Error(responseData?.message || 'Erro ao enviar foto. Tente novamente.');
        }
      }

      // O backend retorna { arquivos: [...] }
      // Precisamos extrair o primeiro arquivo e formatar como ProfilePhotoDTO
      if (responseData?.arquivos && responseData.arquivos.length > 0) {
        const arquivo = responseData.arquivos[0];
        const profileDto: ProfilePhotoDTO = {
          fileId: arquivo.storageId || arquivo.id,
          webViewLink: `/api/arquivos/${arquivo.storageId || arquivo.id}/view`,
          thumbnailLink: `/api/arquivos/${arquivo.storageId || arquivo.id}/view`,
        };
        
        return profileDto;
      }

      toast.success('Foto atualizada com sucesso.');
      return responseData as ProfilePhotoDTO;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro inesperado ao enviar foto';
      
      setUploadError(errorMessage);
      toast.error(errorMessage);
      console.error('Upload error:', error);
      
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    isUploading,
    uploadError,
    uploadProfilePhoto,
    clearError,
  };
};