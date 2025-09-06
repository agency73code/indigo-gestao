export interface TherapistCreateData {
    // Dados pessoais básicos
    nome: string;
    cpf: string;
    data_nascimento: string;
    telefone?: string;
    celular: string;
    foto_perfil?: string;
    email: string;
    email_indigo: string;
    
    // Dados do veículo
    possui_veiculo: 'sim' | 'nao';
    placa_veiculo?: string;
    modelo_veiculo?: string;
    
    // Dados bancários
    banco: string;
    agencia: string;
    conta: string;
    chave_pix?: string;
    
    // Dados da empresa (opcional)
    cnpj_empresa?: string;
    razao_social?: string;
    
    // Dados administrativos
    data_entrada: string;
    perfil_acesso: string;
    
    // Relacionamentos
    enderecos?: {
        cep: string;
        logradouro: string;
        numero: string;
        bairro: string;
        cidade: string;
        uf: string;
        complemento?: string;
        tipo_endereco_id: number;
        principal?: number;
    }[];
    
    areas_atuacao?: number[];
    
    cargos?: {
        cargo_id: number;
        numero_conselho?: string;
        data_entrada: Date;
    }[];

    // Formação
    graduacao: string;
    instituicaoGraduacao: string;
    anoFormatura: string;
    posGraduacao?: string;
    instituicaoPosGraduacao?: string;
    anoPosGraduacao?: string;
    cursos?: string;

    documentos?: {
        tipo_documento?: string;
        caminho_arquivo?: string;
    }[]; 
}