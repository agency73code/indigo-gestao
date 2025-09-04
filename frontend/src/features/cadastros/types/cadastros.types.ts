export interface Terapeuta {
    id?: string;
    // Dados pessoais
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    rg: string;
    dataNascimento: string;
    estadoCivil: string;
    
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
    crp: string;
    especialidades: string[];
    dataInicio: string;
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

export interface CadastroFormProps<T> {
    onSubmit: (data: T) => void;
    isLoading?: boolean;
    initialData?: T;
}
