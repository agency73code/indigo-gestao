import { authFetch } from '@/lib/http';
import { MOCK_ENABLED, MOCK_DOCUMENTS } from '../arquivos/mocks/documents.mock';

// Tipos para arquivos
export type FileMeta = {
  id: string;
  storageId?: string;
  tipo_documento: string;
  nome: string;
  tamanho: number;
  tipo_conteudo: string;
  data_envio: string;
  descricao_documento?: string | null;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Simulação de delay para mock (opcional)
const mockDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Funções para listar arquivos
export async function listFiles(params: { ownerType: "cliente" | "terapeuta"; ownerId: string }): Promise<FileMeta[]> {
  if (MOCK_ENABLED) {
    console.log('📋 [MOCK] Listando arquivos:', params);
    await mockDelay(600);
    
    // Buscar documentos do mock
    const ownerDocs = MOCK_DOCUMENTS[params.ownerType];
    const docs = ownerDocs?.[params.ownerId] || ownerDocs?.['default'] || [];
    
    console.log('📋 [MOCK] Documentos encontrados:', docs.length);
    return docs;
  }
  
  const base = API_BASE_URL?.replace(/\/+$/, '') || '';
  const url = `${base}/arquivos?ownerType=${params.ownerType}&ownerId=${params.ownerId}`;

  const res = await authFetch(url.toString(), { method: 'GET' });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `Falha ao carregar arquivos (${res.status})`;
    throw new Error(msg);
  }

  if (Array.isArray(data)) {
    return data.map(normalizeFileMeta);
  }

  if (Array.isArray(data?.arquivos)) {
    return data.arquivos.map(normalizeFileMeta);
  }

  return [];
}

// Funções para construir URLs
export function buildViewUrl(fileId: string, storageId?: string): string {
  const idToUse = encodeURIComponent(storageId || fileId);
  return `${API_BASE_URL}/arquivos/${idToUse}/view`;
}

export function buildDownloadUrl(fileId: string, storageId?: string): string {
  if (MOCK_ENABLED) {
    console.log('⬇️ [MOCK] URL de download gerada para:', fileId);
    // Para mock, usa a mesma URL de visualização como download
    return buildViewUrl(fileId, storageId);
  }
  
  const idToUse = storageId || fileId;
  return `${API_BASE_URL}/arquivos/${idToUse}/download`
}

// ============================================
// Funções de Edição (Cliente e Terapeuta)
// ============================================

// Atualizar dados do CLIENTE
export async function updateCliente(ownerId: string, payload: any): Promise<void> {
  if (MOCK_ENABLED) {
    console.log('💾 [MOCK] Simulando atualização de cliente:', { ownerId, payload });
    await mockDelay(1000);
    console.log('✅ [MOCK] Cliente atualizado com sucesso');
    return;
  }

  const res = await authFetch(`${API_BASE_URL}/clientes/${ownerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    const msg =
      data?.errors?.[0]?.message ??
      data?.message ??
      data?.error ??
      `Falha ao atualizar cliente (${res.status})`;
    throw new Error(msg);
  }
}

// Atualizar dados do TERAPEUTA
export async function updateTerapeuta(ownerId: string, payload: any): Promise<void> {
  if (MOCK_ENABLED) {
    console.log('💾 [MOCK] Simulando atualização de terapeuta:', { ownerId, payload });
    await mockDelay(1000);
    console.log('✅ [MOCK] Terapeuta atualizado com sucesso');
    return;
  }

  const res = await authFetch(`${API_BASE_URL}/terapeutas/${ownerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    const msg = data?.errors?.[0]?.message ?? `Falha ao atualizar terapeuta (${res.status})`;
    throw new Error(msg);
  }
}

// Upload de arquivo (Consulta > Arquivos)
export async function uploadFile(params: {
  ownerType: "cliente" | "terapeuta";
  ownerId: string;
  fullName: string,
  birthDate: string,
  tipo_documento: string;
  file: File;
  descricao_documento?: string;
}): Promise<void> {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('documentType', params.tipo_documento);
  formData.append('ownerType', params.ownerType);
  formData.append('ownerId', params.ownerId);
  formData.append('fullName', params.fullName);
  formData.append('birthDate', params.birthDate);
  if (params.descricao_documento) {
    formData.append('descricao_documento', params.descricao_documento);
  }

  const res = await authFetch('/api/arquivos', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    const msg = data?.message ?? data?.error ?? `Falha ao fazer upload (${res.status})`;
    throw new Error(msg);
  }
}

// Delete de arquivo
export async function deleteFile(fileId: string): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/arquivos/${fileId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    const msg = data?.message ?? data?.error ?? `Falha ao excluir arquivo (${res.status})`;
    throw new Error(msg);
  }
}

function normalizeFileMeta(raw: unknown): FileMeta {
  const value = (raw ?? {}) as Record<string, unknown>;

  const idCandidate = value['id'] ?? value['storageId'] ?? value['arquivo_id'] ?? '';
  const id = typeof idCandidate === 'string' ? idCandidate : String(idCandidate || '');

  const storageCandidate = value['storageId'] ?? value['arquivo_id'] ?? id;
  const storageId = typeof storageCandidate === 'string' ? storageCandidate : String(storageCandidate || id);

  const tipoCandidate = value['tipo_documento'] ?? value['tipo'] ?? 'documento';
  const tipo_documento = typeof tipoCandidate === 'string' ? tipoCandidate : 'documento';

  const descricaoCandidate = value['descricao_documento'] ?? value['descricao'];
  const descricao_documento = typeof descricaoCandidate === 'string' && descricaoCandidate.trim().length > 0
    ? descricaoCandidate
    : null;

  const nomeCandidate = value['nome'];
  const nome = typeof nomeCandidate === 'string' && nomeCandidate.trim().length > 0
    ? nomeCandidate
    : tipo_documento ?? tipo_documento;

  const tamanhoCandidate = value['tamanho'] ?? value['size'] ?? 0;
  const tamanho = typeof tamanhoCandidate === 'number' ? tamanhoCandidate : Number.parseInt(String(tamanhoCandidate), 10) || 0;

  const tipoConteudoCandidate = value['tipo_conteudo'] ?? value['mime_type'] ?? 'application/octet-stream';
  const tipo_conteudo = typeof tipoConteudoCandidate === 'string' ? tipoConteudoCandidate : 'application/octet-stream';

  const dataCandidate = value['data_envio'] ?? value['data_upload'];
  const data_envio = typeof dataCandidate === 'string'
    ? dataCandidate
    : dataCandidate instanceof Date
      ? dataCandidate.toISOString()
      : new Date().toISOString();
  
  return {
    id: id || storageId,
    storageId,
    tipo_documento,
    nome,
    tamanho,
    tipo_conteudo,
    data_envio,
    descricao_documento,
  };
}
