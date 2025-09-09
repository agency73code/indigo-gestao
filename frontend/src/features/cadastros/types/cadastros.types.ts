export interface Terapeuta {
    id?: string;
    // Dados pessoais
    nome: string;
    email: string;
    emailIndigo: string;
    telefone: string;
    celular: string;
    cpf: string;
    dataNascimento: string;
    possuiVeiculo: 'sim' | 'nao';
    placaVeiculo?: string;
    modeloVeiculo?: string;

    // Dados bancários
    banco: string;
    agencia: string;
    conta: string;
    chavePix: string;

    // Endereço pessoal
    endereco: {
        cep: string;
        rua: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
    };

    // Dados profissionais
    dadosProfissionais: Array<{
        areaAtuacao: string;
        cargo: string;
        numeroConselho?: string;
    }>;

    numeroConvenio?: string;
    dataEntrada: string;
    dataSaida?: string;
    crp: string;
    especialidades: string[];
    dataInicio: string;
    dataFim?: string;
    valorConsulta: string;
    formasAtendimento: string[];

    // Formação
    formacao: {
        graduacao: string;
        instituicaoGraduacao: string;
        anoFormatura: string;
        posGraduacao?: string;
        instituicaoPosGraduacao?: string;
        anoPosGraduacao?: string;
        cursos?: string;
    };

    // Arquivos
    arquivos: {
        fotoPerfil?: File | string;
        diplomaGraduacao?: File | string;
        diplomaPosGraduacao?: File | string;
        registroCRP?: File | string;
        comprovanteEndereco?: File | string;
    };

    // Dados CNPJ (opcional)
    cnpj?: {
        numero: string;
        razaoSocial: string;
        nomeFantasia: string;
        endereco: {
            cep: string;
            rua: string;
            numero: string;
            complemento?: string;
            bairro: string;
            cidade: string;
            estado: string;
        };
    };
}

export interface Paciente {
    id?: string;
    nome: string;
    email: string;
    telefone: string;
    dataNascimento: string;
    cpf: string;
    endereco: {
        cep: string;
        rua: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
    };
    responsavel?: {
        nome: string;
        telefone: string;
        email: string;
        parentesco: string;
    };
    observacoes?: string;
}

export interface Cliente {
    id?: string;
    
    // Dados pessoais
    nome: string;
    dataNascimento: string;
    nomeMae: string;
    cpfMae: string;
    nomePai?: string;
    cpfPai?: string;
    telefonePai?: string;
    emailContato: string;
    dataEntrada: string;
    dataSaida?: string;
    maisDeUmPai: 'sim' | 'nao';
    nomePai2?: string;
    cpfPai2?: string;
    telefonePai2?: string;
    
    // Endereços (cliente pode ter vários)
    enderecos: Array<{
        cep: string;
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        uf: string;
    }>;
    maisDeUmEndereco: 'sim' | 'nao';
    
    // Dados pagamento
    dadosPagamento: {
        nomeTitular: string;
        numeroCarteirinha?: string;
        
        // Telefones com controle de exibição
        telefone1: string;
        mostrarTelefone2?: boolean;
        telefone2?: string;
        mostrarTelefone3?: boolean;
        telefone3?: string;
        
        // E-mails com controle de exibição
        email1: string;
        mostrarEmail2?: boolean;
        email2?: string;
        mostrarEmail3?: boolean;
        email3?: string;
        
        // Sistema de pagamento (radio button principal)
        sistemaPagamento: 'reembolso' | 'liminar' | 'particular';
        
        // Campos específicos para Reembolso
        prazoReembolso?: string;
        
        // Campos específicos para Liminar
        numeroProcesso?: string;
        nomeAdvogado?: string;
        telefoneAdvogado1?: string;
        mostrarTelefoneAdvogado2?: boolean;
        telefoneAdvogado2?: string;
        mostrarTelefoneAdvogado3?: boolean;
        telefoneAdvogado3?: string;
        emailAdvogado1?: string;
        mostrarEmailAdvogado2?: boolean;
        emailAdvogado2?: string;
        mostrarEmailAdvogado3?: boolean;
        emailAdvogado3?: string;
        
        // Campos específicos para Particular
        houveNegociacao?: 'sim' | 'nao';
        valorSessao?: string;
    };
    
    // Dados escola
    dadosEscola: {
        tipoEscola: 'particular' | 'publica';
        nome: string;
        telefone: string;
        email?: string;
        endereco: {
            cep?: string;
            logradouro?: string;
            numero?: string;
            complemento?: string;
            bairro?: string;
            cidade?: string;
            uf?: string;
        };
    };
}

export interface CadastroFormProps<T> {
    onSubmit: (data: T) => void;
    isLoading?: boolean;
    initialData?: T;
}
