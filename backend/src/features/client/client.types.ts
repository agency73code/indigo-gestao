export interface ClientCreateData {
    nome: string;
    data_nascimento: string | Date;
    email_contato: string;
    data_entrada: string | Date;
    perfil_acesso: string;

    enderecos?: {
        cep: string;
        rua: string;
        numero: string;
        bairro: string;
        cidade: string;
        uf: string;
        complemento?: string;
        tipo_endereco_id: number;
        principal?: number;
    }[];

    escolas?: {
        tipo_escola: string;
        nome: string;
        telefone: string;
        email: string;
        enderecos?:{
            cep: string;
            rua: string;
            numero: string;
            bairro: string;
            cidade: string;
            uf: string;
            complemento?: string;
            tipo_endereco_id: number;
            principal: number;
        }[];
    }[];

    responsaveis?: {
        nome: string;
        cpf: string;
        telefone?: string;
        email?: string;
        parentesco: string;
        prioridade?: number;
    }[];

    pagamentos?: {
        nome?: string;
        numero_carteirinha?: string;
        tipo_sistema: string;
        prazo_reembolso_dias?: number;
        numero_processo?: string;
        nome_advogado?: string;
        valor_sessao?: number;
        pagamento_contatos?: {
            categoria?: string;
            tipo: string;
            valor: string;
        }[];
    }[];
}