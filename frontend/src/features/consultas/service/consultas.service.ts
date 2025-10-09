import { authFetch } from '@/lib/http';
import { MOCK_ENABLED, MOCK_DOCUMENTS } from '../arquivos/mocks/documents.mock';

// Tipos para arquivos
export type FileMeta = {
  id: string;
  tipo_documento: string;
  name: string;
  size: number;
  contentType: string;
  uploadedAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Simulação de delay para mock (opcional)
const mockDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Funções para listar arquivos
export async function listFiles(params: { ownerType: "cliente" | "terapeuta"; ownerId: string }): Promise<FileMeta[]> {
  // Se mock estiver habilitado, retorna dados mockados
  if (MOCK_ENABLED) {
    console.log('📁 [MOCK] Carregando documentos mockados para:', params);
    await mockDelay(); // Simula delay da API
    
    const ownerData = MOCK_DOCUMENTS[params.ownerType];
    let mockData = ownerData?.[params.ownerId] || [];
    
    // Se não encontrou dados para o ID específico, usa o 'default'
    if (mockData.length === 0 && ownerData?.['default']) {
      console.log('📁 [MOCK] ID específico não encontrado, usando dados default');
      mockData = ownerData['default'];
    }
    
    console.log('📁 [MOCK] Documentos encontrados:', mockData.length);
    return mockData;
  }

  // Chamada real da API
  const url = new URL('/api/files', API_BASE_URL);
  url.searchParams.set('ownerType', params.ownerType);
  url.searchParams.set('ownerId', params.ownerId);

  const res = await authFetch(url.toString(), { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha ao carregar arquivos (${res.status})`;
    throw new Error(msg);
  }

  return (data ?? []) as FileMeta[];
}

// Funções para construir URLs
export function buildViewUrl(fileId: string): string {
  if (MOCK_ENABLED) {
    // Para mock, usar URLs de placeholder diretas
    const mockUrls: Record<string, string> = {
      // Cliente default
      'doc-cliente-default-1': 'https://via.placeholder.com/400x300/4CAF50/white?text=Foto+Cliente',
      'doc-cliente-default-2': 'https://via.placeholder.com/600x800/2196F3/white?text=Documento+ID',
      
      // Terapeuta default  
      'doc-terapeuta-default-1': 'https://via.placeholder.com/400x300/FF9800/white?text=Foto+Terapeuta',
      'doc-terapeuta-default-2': 'https://via.placeholder.com/600x800/9C27B0/white?text=Diploma',
      'doc-terapeuta-default-3': 'https://via.placeholder.com/600x800/E91E63/white?text=CRP',
      
      // IDs específicos mockados
      'doc-cliente-1': 'https://via.placeholder.com/400x300/4CAF50/white?text=Foto+João',
      'doc-cliente-2': 'https://via.placeholder.com/600x800/2196F3/white?text=RG+João',
      'doc-terapeuta-1': 'https://via.placeholder.com/400x300/FF5722/white?text=Foto+Ana',
      'doc-terapeuta-2': 'https://via.placeholder.com/600x800/795548/white?text=Diploma+Ana',
    };
    
    const mockUrl = mockUrls[fileId] || 'https://via.placeholder.com/600x400/607D8B/white?text=Documento+Mock';
    console.log('🔍 [MOCK] URL de visualização gerada para:', fileId, '→', mockUrl);
    return mockUrl;
  }
  
  return `${API_BASE_URL}/api/files/${fileId}/view`;
}

export function buildDownloadUrl(fileId: string): string {
  if (MOCK_ENABLED) {
    console.log('⬇️ [MOCK] URL de download gerada para:', fileId);
    // Para mock, usa a mesma URL de visualização como download
    return buildViewUrl(fileId);
  }
  
  return `${API_BASE_URL}/api/files/${fileId}/download`;
}