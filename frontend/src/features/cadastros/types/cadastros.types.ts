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

    // Dados bancÃ¡rios
    banco: string;
    agencia: string;
    conta: string;
    chavePix: string;
    valorHoraAcordado?: number | null;
    professorUnindigo?: 'sim' | 'nao';
    disciplinaUniindigo?: string | null;

    // EndereÃ§o pessoal
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

    // FormaÃ§Ã£o
    Formação: {
        graduacao: string;
        instituicaoGraduacao: string;
        anoFormatura: string;
        posGraduacao?: string;
        instituicaoPosGraduacao?: string;
        anoPosGraduacao?: string;
        cursos?: string;
        // Novos campos FRONT (não enviados ao back por compatibilidade)
        posGraduacoes?: Array<{
            tipo: 'lato' | 'stricto';
            curso: string;
            instituicao: string;
            conclusao: string; // AAAA-MM
            comprovanteUrl?: string | null;
        }>;
        participacaoCongressosDescricao?: string | null;
        publicacoesLivrosDescricao?: string | null;    };

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

export interface Cuidador {
    relacao: 'mae' | 'pai' | 'avo' | 'tio' | 'responsavel' | 'tutor' | 'outro' | '';
    descricaoRelacao?: string;
    nome: string;
    cpf: string;
    profissao?: string;
    escolaridade?: string;
    telefone: string;
    email: string;
    endereco?: {
        cep?: string;
        logradouro?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        cidade?: string;
        uf?: string;
    };
}

export interface Cliente {
    id?: string;
    
    // Dados pessoais
    nome: string;
    cpf: string;
    dataNascimento: string;
    emailContato: string;
    dataEntrada: string;
    dataSaida?: string;
    
    // Cuidadores (substitui os campos de pai/mãe)
    cuidadores?: Cuidador[];
    
    // EndereÃ§os (cliente pode ter vÃ¡rios)
    enderecos: Array<{
        cep: string;
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        uf: string;
        residenciaDe?: string; // Novo campo para quem reside nesse endereço
        outroResidencia?: string; // Para quando residenciaDe for "outro"
    }>;
    maisDeUmEndereco: 'sim' | 'nao';
    
    // Dados pagamento
    dadosPagamento: {
        nomeTitular: string;
        numeroCarteirinha?: string;
        
        // Telefones com controle de exibiÃ§Ã£o
        telefone1: string;
        mostrarTelefone2?: boolean;
        telefone2?: string;
        mostrarTelefone3?: boolean;
        telefone3?: string;
        
        // E-mails com controle de exibiÃ§Ã£o
        email1: string;
        mostrarEmail2?: boolean;
        email2?: string;
        mostrarEmail3?: boolean;
        email3?: string;
        
        // Sistema de pagamento (radio button principal)
        sistemaPagamento: 'reembolso' | 'liminar' | 'particular';
        
        // Campos especÃ­ficos para Reembolso
        prazoReembolso?: string;
        
        // Campos especÃ­ficos para Liminar
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
        
        // Campos especÃ­ficos para Particular
        houveNegociacao?: 'sim' | 'nao';
        valorAcordado?: string; // Renomeado de valorSessao para valorAcordado
    };
    
    // Dados escola
    dadosEscola: {
        tipoEscola: 'particular' | 'publica' | 'afastado' | 'clinica-escola';
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
        contatos?: Array<{
            nome: string;
            telefone: string;
            email?: string;
            funcao: string;
        }>;
    };

    // Arquivos
    arquivos?: {
        fotoPerfil?: File | string | null;
        documentoIdentidade?: File | string | null;
        comprovanteCpf?: File | string | null;
        comprovanteResidencia?: File | string | null;
        carterinhaPlano?: File | string | null;
        relatoriosMedicos?: File | string | null;
        prescricaoMedica?: File | string | null;
    };
}

export interface CadastroFormProps<T> {
    onSubmit: (data: T) => void;
    isLoading?: boolean;
    initialData?: T;
}




