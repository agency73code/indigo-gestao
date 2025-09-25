import type { Decimal } from "@prisma/client/runtime/library"

export type TherapistForm = {
  nome: string
  email: string
  emailIndigo: string
  telefone?: string | null
  celular: string
  cpf: string
  dataNascimento: Date
  possuiVeiculo: string
  placaVeiculo?: string | null
  modeloVeiculo?: string | null
  banco: string
  agencia: string
  conta: string
  chavePix: string
  valorHoraAcordado: string
  professorUnindigo: string
  disciplinaUniindigo?: string | null | undefined
  endereco: {
    cep: string
    rua: string
    numero: string
    complemento?: string | null | undefined
    bairro: string
    cidade: string
    estado: string
  }
  dataInicio: Date
  dataFim: Date | null | undefined
  formacao: {
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
  }
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
  dadosProfissionais: {
    areaAtuacao: string
    cargo: string
    numeroConselho: string
  }[],
  documentos: {
    tipo_documento: string,
    view_url: string,
    download_url: string,
    data_upload: Date,
  }[],
}

export type TherapistDetails = {
  nome: string
  email: string
  emailIndigo: string
  telefone: string
  celular: string
  cpf: string
  dataNascimento: string
  possuiVeiculo: string
  placaVeiculo: string
  modeloVeiculo: string
  banco: string
  agencia: string
  conta: string
  chavePix: string
  valorHoraAcordado: string
  professorUnindigo: string
  disciplinaUniindigo: string
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
  dataFim: Date | null
  formacao: {
    graduacao: string
    instituicaoGraduacao: string
    anoFormatura: number
    posGraduacoes: {
      tipo: string
      curso: string
      instituicao: string
      conclusao: string
    }[]
    participacaoCongressosDescricao: string
    publicacoesLivrosDescricao: string
  }
  cnpj: {
    numero: string
    razaoSocial: string
    nomeFantasia: string
    endereco: {
      cep: string
      rua: string
      numero: string
      complemento: string
      bairro: string
      cidade: string
      estado: string
    }
  }
  dadosProfissionais: {
    areaAtuacao: string
    cargo: string
    numeroConselho: string
  }[],
  arquivos?: {
    id?: string
    nome?: string
    tipo?: string
    tamanho?: number
    data?: string
  }[]
}

export type TherapistSession = {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  status: 'ATIVO' | 'INATIVO';
  especialidade?: string;
  conselho?: string;
  registroConselho?: string;
  avatarUrl?: string;
  pessoa?: {
      cpf?: string;
      dataNascimento?: string;
      genero?: string;
      observacoes?: string;
  };
  endereco?: {
      cep?: string;
      rua?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      uf?: string;
  };
  profissional?: {
      cargaHorariaSemanal?: number;
      atendeConvenio?: boolean;
      especialidades?: string[] | undefined;
      valorConsulta?: number;
      formasAtendimento?: string[] | undefined;
  };
  formacao?: {
      curso: string;
      instituicao: string;
      ano?: number;
  }[];
  arquivos?: {
      id: number;
      nome: string;
      tipo?: string;
      tamanho?: number;
      data?: string;
  }[];
  cnpj?: string;
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
    }[];
    registro_profissional?: {
        id: number;
        area_atuacao: string;
        cargo?: string | null;
        numero_conselho?: string | null;
    }[];
    documentos_terapeuta?: {
        id: number;
        tipo_documento: string;
        view_url: string;
        download_url: string;
        data_upload: Date;
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
}