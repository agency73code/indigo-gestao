export interface Caregiver {
    relacao: string;
    descricaoRelacao?: string | null;
    nome: string;
    cpf: string;
    profissao?: string | null;
    escolaridade?: string | null;
    telefone: string;
    email: string;
    endereco: {
        cep: string;
        logradouro: string;
        numero: string;
        complemento?: string | null;
        bairro: string;
        cidade: string;
        uf: string;
    };
}

export interface Client {
    id?: string;
    
    // Dados pessoais
    nome: string;
    cpf: string | null;
    dataNascimento: Date | null;
    emailContato: string;
    dataEntrada: Date | null;
    dataSaida?: Date | null;
    
    // Cuidadores (substitui os campos de pai/mãe)
    cuidadores: Caregiver[];
    
    // EndereÃ§os (cliente pode ter vÃ¡rios)
    enderecos: Array<{
        cep: string | null;
        logradouro: string | null;
        numero: string | null;
        complemento: string | null;
        bairro: string | null;
        cidade: string | null;
        uf: string | null;
        residenciaDe?: string | null; // Novo campo para quem reside nesse endereço
        outroResidencia?: string | null; // Para quando residenciaDe for "outro"
    }>;
    
    // Dados pagamento
    dadosPagamento: {
        nomeTitular: string | null;
        numeroCarteirinha: string | null;
        
        // Telefones com controle de exibiÃ§Ã£o
        telefone1: string | null;
        mostrarTelefone2?: boolean;
        telefone2?: string | null;
        mostrarTelefone3?: boolean;
        telefone3?: string | null;
        
        // E-mails com controle de exibiÃ§Ã£o
        email1: string | null;
        mostrarEmail2?: boolean;
        email2?: string | null;
        mostrarEmail3?: boolean;
        email3?: string | null;
        
        // Sistema de pagamento (radio button principal)
        sistemaPagamento: 'reembolso' | 'liminar' | 'particular';
        
        // Campos especÃ­ficos para Reembolso
        prazoReembolso?: string | null;
        
        // Campos especÃ­ficos para Liminar
        numeroProcesso?: string | null;
        nomeAdvogado?: string | null;
        telefoneAdvogado1?: string | null;
        mostrarTelefoneAdvogado2?: boolean;
        telefoneAdvogado2?: string | null;
        mostrarTelefoneAdvogado3?: boolean;
        telefoneAdvogado3?: string | null;
        emailAdvogado1?: string | null;
        mostrarEmailAdvogado2?: boolean;
        emailAdvogado2?: string | null;
        mostrarEmailAdvogado3?: boolean;
        emailAdvogado3?: string | null;
        
        // Campos especificos para Particular
        houveNegociacao?: 'sim' | 'nao';
        valorAcordado?: string | null; // Renomeado de valorSessao para valorAcordado
        valorSessao?: string | null;
    };
    
    // Dados escola
    dadosEscola: {
        tipoEscola: 'particular' | 'publica' | 'afastado' | 'clinica-escola';
        nome: string | null;
        telefone: string | null;
        email?: string | null;
        endereco: {
            cep?: string | null;
            logradouro?: string | null;
            numero?: string | null;
            complemento?: string | null;
            bairro?: string | null;
            cidade?: string | null;
            uf?: string | null;
        };
        contatos: Array<{
            nome: string | null;
            telefone: string | null;
            email?: string | null;
            funcao: string | null;
        }>;
    };

    // Arquivos
    arquivos?: Array<{
        tipo: string | null;
        arquivo_id: string | null;
        mime_type: string | null;
        tamanho: number | null;
        data_upload: Date;
    }>;
}

export interface DBClientQueryPage {
    id: string;
    nome: string | null;
    emailContato: string | null;
    cuidadores: {
        telefone: string | null;
        nome: string | null;
        cpf: string | null;
    }[];
    status: string | null;
    dataNascimento: Date | null;
    enderecos: {
        endereco: {
            cep: string | null;
            rua: string | null;
            numero: string | null;
            bairro: string | null;
            cidade: string | null;
            uf: string | null;
            complemento: string | null;
        };
    }[];
    arquivos: {
        tipo: string | null;
        mime_type: string | null;
        arquivo_id: string | null;
        tamanho: number | null;
        data_upload: Date | null;
    }[];
}

export type EnderecoInput = {
  cep?: string | null;
  rua?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  complemento?: string | null;
};

// Tipos base
export interface UpdateAddress {
  id?: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface UpdateAddressClient extends UpdateAddress {
  id?: number;
  residenciaDe: string | null;
  outroResidencia: string | null;
}

export interface UpdateCaregiver {
  id?: number;
  relacao: string;
  descricaoRelacao: string | null;
  nome: string;
  cpf: string;
  profissao: string | null;
  escolaridade: string;
  telefone: string;
  email: string;
  endereco: UpdateAddress;
}

export interface UpdateDataPayment {
  nomeTitular: string;
  numeroCarteirinha: string | null;
  telefone1: string;
  telefone2: string | null;
  telefone3: string | null;
  email1: string;
  email2: string | null;
  email3: string | null;
  sistemaPagamento: string;
  prazoReembolso: string | null;
  numeroProcesso: string | null;
  nomeAdvogado: string | null;
  telefoneAdvogado1: string | null;
  telefoneAdvogado2: string | null;
  telefoneAdvogado3: string | null;
  emailAdvogado1: string | null;
  emailAdvogado2: string | null;
  emailAdvogado3: string | null;
  houveNegociacao: string;
  valorAcordado: string | null;
}

export interface UpdateSchoolContact {
  nome: string;
  funcao: string | null;
  telefone: string;
  email: string | null;
}

export interface UpdateDataSchool {
  tipoEscola: string;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  endereco: UpdateAddress;
  contatos: UpdateSchoolContact[];
}

export interface UpdateClient {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: Date;
  emailContato: string;
  dataEntrada: Date;
  dataSaida: Date | null;
  status: string;
  cuidadores: UpdateCaregiver[];
  enderecos: UpdateAddress[];
  dadosPagamento: UpdateDataPayment;
  dadosEscola: UpdateDataSchool;
}

// Tipo para o update (todos os campos opcionais)
export type ClientUpdate = Partial<UpdateClient>;
