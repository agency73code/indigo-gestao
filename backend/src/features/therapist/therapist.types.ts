export enum TerapeutaPossuiVeiculo {
  Sim = 'sim',
  Nao = 'nao',
}

export enum TerapeutaAtividade {
  Ativo = 'ativo',
  Inativo = 'inativo',
}

export interface AreaAtuacao {
  id: number;
  nome: string;
}

export interface Cargo {
  id: number;
  nome: string;
}

export interface TipoEndereco {
  id: number;
  tipo: string;
}

export interface Endereco {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface TerapeutaEndereco {
  id: number;
  terapeuta_id: string;
  endereco_id: number;
  tipo_endereco_id: number;
  principal: number;
  criado_em: Date;
  atualizado_em: Date;
  endereco: Endereco;
  tipo_endereco: TipoEndereco;
}

export interface TerapeutaCargo {
  terapeuta_id: string;
  cargo_id: number;
  numero_conselho: string | null;
  data_entrada: Date;
  data_saida: Date | null;
  cargo: Cargo;
}

export interface TerapeutaAreaAtuacao {
  terapeuta_id: string;
  area_atuacao_id: number;
  area_atuacao: AreaAtuacao;
}

export interface DocumentoTerapeuta {
  id: number;
  terapeuta_id: string;
  tipo_documento: string;
  caminho_arquivo: string;
  data_upload: Date;
}

export interface Terapeuta {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: Date;
  telefone: string | null;
  celular: string;
  foto_perfil: string | null;
  email: string;
  email_indigo: string;
  possui_veiculo: TerapeutaPossuiVeiculo;
  placa_veiculo: string | null;
  modelo_veiculo: string | null;
  banco: string;
  agencia: string;
  conta: string;
  chave_pix: string | null;
  cnpj_empresa: string | null;
  razao_social: string | null;
  graduacao: string | null;
  grad_instituicao: string | null;
  ano_formatura: string | null;
  pos_graduacao: string | null;
  pos_grad_instituicao: string | null;
  ano_pos_graduacao: string | null;
  cursos: string | null;
  data_entrada: Date;
  data_saida: Date | null;
  perfil_acesso: string;
  atividade: TerapeutaAtividade;
  senha: string | null;
  token_redefinicao: string | null;
  validade_token: Date | null;
  criado_em: Date;
  atualizado_em: Date;
  documentos_terapeuta: DocumentoTerapeuta[];
  terapeuta_area_atuacao: TerapeutaAreaAtuacao[];
  terapeuta_cargo: TerapeutaCargo[];
  terapeuta_endereco: TerapeutaEndereco[];
}