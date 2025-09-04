export interface Terapeuta {
    id?: string;
    nome: string;
    email: string;
    telefone: string;
    especialidade: string;
    crp: string;
    endereco: {
        cep: string;
        rua: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
    };
    dataInicio: string;
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
