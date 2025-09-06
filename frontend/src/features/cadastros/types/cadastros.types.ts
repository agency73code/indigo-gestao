export interface Terapeuta {
    // Dados pessoais
    nome: string;
    cpf: string;
    dataNascimento: string;
    telefone: string;
    celular: string;
    email: string;
    emailIndigo: string;

    // Dados do veículo
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
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        uf: string;
        tipo_endereco_id: 1;
        principal?: 1;
    }[];
    
    // Dados profissionais
    areas_atuacao?: number[];

    cargos?: {
        cargo_id: number;
        numero_conselho?: string;
        data_entrada: Date;
    }[];

    // dataInicio: string;
    // dataFim?: string;

    dataEntrada: string;
    dataSaida?: string;

    // crp: string;
    // especialidades: string[];
    // valorConsulta: string;
    // formasAtendimento: string[];
    
    // Formação
    graduacao: string;
    instituicaoGraduacao: string;
    anoFormatura: string;
    posGraduacao?: string;
    instituicaoPosGraduacao?: string;
    anoPosGraduacao?: string;
    cursos?: string;
    
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

export interface CadastroFormProps<T> {
    onSubmit: (data: T) => void;
    isLoading?: boolean;
    initialData?: T;
}
