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
  documentos_terapeuta: DocumentoTerapeuta[];
  terapeuta_area_atuacao: TerapeutaAreaAtuacao[];
  terapeuta_cargo: TerapeutaCargo[];
  terapeuta_endereco: TerapeutaEndereco[];
}

export const TIPO_ENDERECO_MAP = {
  residencial: 1,
  institucional: 2,
  empresarial: 3,
} as const;

export const AREA_MAP = {
  'Fonoaudiologia': 1,
  'Psicomotricidade': 2,
  'Fisioterapia': 3,
  'Terapia Ocupacional': 4,
  'Psicopedagogia': 5,
  'Educador Físico': 6,
  'Terapia ABA': 7,
  'Musicoterapia': 8,
  'Pedagogia': 9,
  'Neuropsicologia': 10,
} as const;

export const CARGO_MAP = {
  'Acompanhante Terapeutico': 1,
  'Coordenador ABA': 2,
  'Supervisor ABA': 3,
  'Mediador de Conflitos': 4,
  'Coordenador Executivo': 5,
  'Professor UniIndigo': 6,
  'Terapeuta clinico': 7,
  'Terapeuta Supervisor': 8,
  'Gerente': 9,
} as const;