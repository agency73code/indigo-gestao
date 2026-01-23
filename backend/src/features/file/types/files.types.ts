export type FileForDownload = {
  id: number;
  storage_id: string;
  name?: string | null;
  mime_type?: string | null;
};

export type dbFileType = {
  storage_id: string;
  mime_type?: string | null;
  name?: string | null;
}

export type DbFileForAuth = {
  id: number;
  arquivo_id: string | null;
  mime_type: string | null;
  descricao_documento: string | null;
  clienteId: string | null;
  terapeutaId: string | null;
}