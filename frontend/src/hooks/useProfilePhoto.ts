import { useState, useCallback } from 'react';
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
  uploadProfilePhoto: (croppedBlob: Blob, userId: string) => Promise<ProfilePhotoDTO | null>;
  clearError: () => void;
}

/**
 * Hook para gerenciar upload de foto de perfil
 * Prepara os dados para enviar ao endpoint POST /api/profile-photo
 */
export const useProfilePhoto = (): UseProfilePhotoReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  const uploadProfilePhoto = useCallback(async (
    croppedBlob: Blob,
    userId: string
  ): Promise<ProfilePhotoDTO | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Criar FormData para enviar ao backend
      const formData = new FormData();
      
      // Criar arquivo WebP com nome padronizado
      const fileName = `avatar_${userId}.webp`;
      const file = createFileFromBlob(croppedBlob, fileName);
      
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('folder', 'avatars'); // Opcional: organizar no Drive

      // Fazer upload para o endpoint do backend
      const response = await fetch('/api/profile-photo', {
        method: 'POST',
        body: formData,
        // Não definir Content-Type, deixar o browser definir com boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        switch (response.status) {
          case 400:
            throw new Error('Arquivo inválido. Use JPG, PNG ou WebP.');
          case 413:
            throw new Error('Arquivo muito grande. Máximo 5MB.');
          case 415:
            throw new Error('Tipo de arquivo não suportado.');
          default:
            throw new Error(errorData?.message || 'Erro ao enviar foto. Tente novamente.');
        }
      }

      const result: ProfilePhotoDTO = await response.json();
      
      toast.success('Foto atualizada com sucesso.');
      return result;

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