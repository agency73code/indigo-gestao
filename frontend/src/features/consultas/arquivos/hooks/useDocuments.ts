import { useState, useEffect, useCallback, useRef } from 'react';
import { listFiles, buildViewUrl, buildDownloadUrl, type FileMeta } from '../../service/consultas.service';

interface UseDocumentsProps {
  ownerType: 'cliente' | 'terapeuta';
  ownerId: string;
  enabled?: boolean;
}

interface UseDocumentsReturn {
  data: FileMeta[] | null;
  isLoading: boolean;
  error: string | null;
  onView: (file: FileMeta) => void;
  onDownload: (file: FileMeta) => void;
  pendingId: string | null;
}

export function useDocuments({ ownerType, ownerId, enabled = true }: UseDocumentsProps): UseDocumentsReturn {
  const [data, setData] = useState<FileMeta[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Debounce para múltiplos cliques - usando useRef para manter a referência
  const debounceMap = useRef(new Map<string, boolean>()).current;

  const loadDocuments = useCallback(async () => {
    if (!enabled || !ownerId) {
      console.log('🚫 [useDocuments] Carregamento cancelado:', { enabled, ownerId });
      return;
    }

    console.log('📋 [useDocuments] Iniciando carregamento:', { ownerType, ownerId, enabled });
    setIsLoading(true);
    setError(null);

    try {
      const documents = await listFiles({ ownerType, ownerId });
      console.log('📋 [useDocuments] Documentos recebidos:', documents);
      setData(documents);
      
      // Dispatch eventos de observabilidade
      if (documents.length === 0) {
        console.log('📋 [useDocuments] Nenhum documento encontrado');
        dispatchEvent(new CustomEvent('documents:list:empty', { 
          detail: { ownerType, ownerId } 
        }));
      } else {
        console.log('📋 [useDocuments] Documentos carregados com sucesso:', documents.length);
        dispatchEvent(new CustomEvent('documents:list:success', { 
          detail: { ownerType, ownerId, count: documents.length } 
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('📋 [useDocuments] Erro ao carregar:', errorMessage);
      setError(getErrorMessage(errorMessage));
      
      dispatchEvent(new CustomEvent('documents:list:error', { 
        detail: { ownerType, ownerId, error: errorMessage } 
      }));
    } finally {
      setIsLoading(false);
    }
  }, [ownerType, ownerId, enabled]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const onView = useCallback((file: FileMeta) => {
    // Prevenir múltiplos cliques
    if (debounceMap.get(`view-${file.id}`)) return;
    debounceMap.set(`view-${file.id}`, true);
    
    setTimeout(() => debounceMap.delete(`view-${file.id}`), 1000);

    setPendingId(file.id);
    
    try {
      const viewUrl = buildViewUrl(file.id);
      window.open(viewUrl, '_blank', 'noopener');
      
      // Dispatch evento de observabilidade
      dispatchEvent(new CustomEvent('documents:view:click', { 
        detail: { fileId: file.id, tipo_documento: file.tipo_documento } 
      }));
    } finally {
      setPendingId(null);
    }
  }, [debounceMap]);

  const onDownload = useCallback((file: FileMeta) => {
    // Prevenir múltiplos cliques
    if (debounceMap.get(`download-${file.id}`)) return;
    debounceMap.set(`download-${file.id}`, true);
    
    setTimeout(() => debounceMap.delete(`download-${file.id}`), 1000);

    setPendingId(file.id);
    
    try {
      const downloadUrl = buildDownloadUrl(file.id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Dispatch evento de observabilidade
      dispatchEvent(new CustomEvent('documents:download:click', { 
        detail: { fileId: file.id, tipo_documento: file.tipo_documento } 
      }));
    } finally {
      setPendingId(null);
    }
  }, [debounceMap]);

  return {
    data,
    isLoading,
    error,
    onView,
    onDownload,
    pendingId
  };
}

function getErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('403')) {
    return 'Você não tem permissão para visualizar este documento.';
  }
  if (errorMessage.includes('404')) {
    return 'Documento não encontrado ou removido.';
  }
  if (errorMessage.includes('5')) {
    return 'Falha ao carregar documentos. Tente novamente.';
  }
  return errorMessage;
}