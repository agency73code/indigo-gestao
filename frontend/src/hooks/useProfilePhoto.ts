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
  uploadProfilePhoto: (croppedBlob: Blob, userId: string) => Promise<ProfilePhotoDTO | null>;
  clearError: () => void;
  flushPendingPhoto: (newUserId: string) => Promise<void>;
}

/**
 * Hook para gerenciar upload de foto de perfil
 * Prepara os dados para enviar ao endpoint POST /api/profile-photo
 */
export const useProfilePhoto = (): UseProfilePhotoReturn => {
  const location = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<Blob | null>(null);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  const uploadProfilePhoto = useCallback(async (
    croppedBlob: Blob,
    userId: string
  ): Promise<ProfilePhotoDTO | null> => {

    // Quando não existir userId(cadastro) só sai
    if (!userId) {
      return null;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Criar arquivo WebP com nome padronizado
      const fileName = `avatar_${userId}.webp`;
      const file = createFileFromBlob(croppedBlob, fileName);
      // Criar FormData para enviar ao backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo_documento', 'fotoPerfil');
      
      const isTerapeuta = location.pathname.includes('/app/consultar/terapeutas') || location.pathname.includes('/app/configuracoes');
      const ownerType = isTerapeuta ? 'terapeuta' : 'cliente';
      const url = `/api/arquivos?ownerType=${ownerType}&ownerId=${userId}`;

      // Fazer upload para o endpoint do backend
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Não definir Content-Type, deixar o browser definir com boundary
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

  const flushPendingPhoto = useCallback(async (newUserId: string) => {
    if (pendingPhoto) {
      await uploadProfilePhoto(pendingPhoto, newUserId);
      setPendingPhoto(null);
    }
  }, [pendingPhoto, uploadProfilePhoto]);

  return {
    isUploading,
    uploadError,
    uploadProfilePhoto,
    clearError,
    flushPendingPhoto,
  };
};