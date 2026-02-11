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
    pixTipo?: 'email' | 'telefone' | 'cpf' | 'cnpj' | 'aleatoria';
    
    // Valores por tipo de atividade (para faturamento)
    valorSessaoConsultorio?: string | null;
    valorSessaoHomecare?: string | null;
    valorHoraDesenvolvimentoMateriais?: string | null;
    valorHoraSupervisaoRecebida?: string | null;
    valorHoraSupervisaoDada?: string | null;
    valorHoraReuniao?: string | null;
    
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
        areaAtuacaoId?: number | string | null;
        cargo: string;
        cargoId?: number | string | null;
        numeroConselho?: string;
    }>;

    dataInicio: string;
    dataFim?: string;

    // FormaÃ§Ã£o
    formacao: {
        graduacao: string;
        instituicaoGraduacao: string;
        anoFormatura: string;
        posGraduacoes?: Array<{
            tipo: 'lato' | 'stricto';
            curso: string;
            instituicao: string;
            conclusao: string;
            comprovanteUrl?: string | null;
        }>;
        participacaoCongressosDescricao?: string | null;
        publicacoesLivrosDescricao?: string | null;
    };

    // Arquivos
    arquivos: {
        fotoPerfil?: File | string;
        diplomaGraduacao?: File | string;
        diplomaPosGraduacao?: File | string;
        registroCRP?: File | string;
        comprovanteEndereco?: File | string;
        outros?: File | string;
        descricaoOutros?: string | null;
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

    avatarUrl?: string;
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
    avatarUrl?: string;
}

export interface Cuidador {
    relacao: 'mae' | 'pai' | 'avo' | 'tio' | 'responsavel' | 'tutor' | 'outro' | '';
    descricaoRelacao?: string;
    nome: string;
    cpf: string;
    dataNascimento?: string;
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
    nome: string | null;
    cpf: string | null;
    dataNascimento: string | null;
    emailContato: string | null;
    dataEntrada: string | null;
    dataSaida?: string | null;
    
    // Cuidadores (substitui os campos de pai/mãe)
    cuidadores?: Cuidador[];
    
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
    maisDeUmEndereco: 'sim' | 'nao';
    
    // Dados pagamento
    dadosPagamento: {
        nomeTitular: string | null;
        numeroCarteirinha?: string | null;
        
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
        
        // Campos especÃ­ficos para Particular
        houveNegociacao?: 'sim' | 'nao';
        valorAcordado?: string | null; // Renomeado de valorSessao para valorAcordado
        valorSessao?: string | null; // Para compatibilidade com mock data
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
        contatos?: Array<{
            nome: string | null;
            telefone: string | null;
            email?: string | null;
            funcao: string | null;
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
        outros?: File | string | null;
        descricaoOutros?: string | null;
    };
}

export interface CadastroFormProps<T> {
    onSubmit: (data: T) => void;
    isLoading?: boolean;
    initialData?: T;
}




