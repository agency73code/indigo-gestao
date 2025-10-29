import type { Decimal } from "@prisma/client/runtime/library"

export type TherapistProfessionalDataInput = {
  areaAtuacao: string
  areaAtuacaoId?: number | string | null | undefined
  cargo: string
  cargoId?: number | string | null | undefined
  numeroConselho: string
}

export type EnderecoStringKeys =
  | 'cep'
  | 'rua'
  | 'numero'
  | 'complemento'
  | 'bairro'
  | 'cidade'
  | 'uf';

export type TherapistForm = {
  nome: string
  email: string
  emailIndigo: string
  telefone: string | null
  celular: string
  cpf: string
  dataNascimento: Date
  possuiVeiculo: string
  placaVeiculo: string | null
  modeloVeiculo: string | null
  banco: string
  agencia: string
  conta: string
  chavePix: string
  pixTipo: 'email' | 'telefone' | 'cpf' | 'cnpj' | 'aleatoria'
  valorHoraAcordado: string
  professorUnindigo: string
  disciplinaUniindigo?: string | null | undefined

  endereco: {
    cep: string
    rua: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
  }

  dataInicio: Date
  dataFim: Date | null | undefined
  formacao?: {
    graduacao: string
    instituicaoGraduacao: string
    anoFormatura: string
    posGraduacoes: {
      tipo: string
      curso: string
      instituicao: string
      conclusao: string
    }[]
    participacaoCongressosDescricao?: string | null
    publicacoesLivrosDescricao?: string | null
  } | null

  cnpj?: {
    numero?: string | null
    razaoSocial?: string | null
    endereco?: {
      cep?: string | null
      rua?: string | null
      numero?: string | null
      complemento?: string | null
      bairro?: string | null
      cidade?: string | null
      estado?: string | null
    } | null
  } | null
  dadosProfissionais: TherapistProfessionalDataInput[],

  // Arquivos
  arquivos?: Array<{
      tipo: string | null,
      arquivo_id: string | null,
      mime_type: string | null,
      tamanho: number | null,
      data_upload: Date,
  }>;
}

export interface TherapistDB {
    id: string;
    nome: string;
    email: string;
    email_indigo: string;
    celular: string;
    telefone?: string | null;
    cpf: string;
    data_nascimento: Date;
    possui_veiculo: boolean;
    placa_veiculo?: string | null;
    modelo_veiculo?: string | null;
    banco?: string | null;
    agencia?: string | null;
    conta?: string | null;
    chave_pix?: string | null;
    pix_tipo?: string | null;
    valor_hora?: Decimal | null;
    professor_uni: boolean;
    endereco_id?: number | null;
    data_entrada: Date | null;
    data_saida?: Date | null;
    perfil_acesso: string;
    atividade: boolean;
    endereco?: {
        cep?: string | null;
        rua?: string | null;
        numero?: string | null;
        complemento?: string | null;
        bairro?: string | null;
        cidade?: string | null;
        uf?: string | null;
    } | null;
    formacao?: {
        id: number;
        graduacao?: string | null;
        instituicao_graduacao?: string | null;
        ano_formatura?: number | null;
        participacao_congressos?: string | null;
        publicacoes_descricao?: string | null;
        pos_graduacao?: {
            id: number;
            tipo?: string | null
            curso?: string | null
            instituicao?: string | null
            conclusao?: string | null
        }[];
    } | null;
    registro_profissional?: {
        id: number;
        area_atuacao_id: number;
        cargo_id?: number | null;
        numero_conselho?: string | null;
        area_atuacao: {
          id: number;
          nome: string;
        };
        cargo?: {
          id: number;
          nome: string;
        } | null;
    }[];
    pessoa_juridica?: {
      id: number;
      cnpj?: string | null;
      razao_social?: string | null;
      endereco?: {
        cep?: string | null;
        rua?: string | null;
        numero?: string | null;
        complemento?: string | null;
        bairro?: string | null;
        cidade?: string | null;
        uf?: string | null;
      } | null;
    } | null;
    disciplina?: {
        id: number;
        nome: string | null;
    }[];
    // Arquivos
    arquivos?: Array<{
        tipo: string | null,
        arquivo_id: string | null,
        mime_type: string | null,
        tamanho: number | null,
        data_upload: Date,
    }>;
}