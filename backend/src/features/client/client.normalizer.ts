import type { ClientCreateData } from "./client.types.js";

function asDate(input: string | Date): Date {
    if (input instanceof Date) return input;
    const s = input.trim();
    return s.length === 10 ? new Date(`${s}T00:00:00`) : new Date(s);
}

export interface FrontCliente {
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

    enderecos: Array<{
        cep: string;
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        uf: string;
    }>;
    maisDeUmEndereco: 'sim' | 'nao';

    dadosEscola?: {
        tipoEscola: 'particular' | 'publica';
        nome: string;
        telefone: string;
        email?: string;
        endereco?: {
        cep?: string;
        logradouro?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        cidade?: string;
        uf?: string;
        };
    };

    dadosPagamento?: {
        nomeTitular: string;
        numeroCarteirinha?: string;

        telefone1: string;
        mostrarTelefone2?: boolean;
        telefone2?: string;
        mostrarTelefone3?: boolean;
        telefone3?: string;

        email1: string;
        mostrarEmail2?: boolean;
        email2?: string;
        mostrarEmail3?: boolean;
        email3?: string;

        sistemaPagamento: 'reembolso' | 'liminar' | 'particular';
        prazoReembolso?: string;
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
        houveNegociacao?: 'sim' | 'nao';
        valorSessao?: string;
    };
}

export async function normalizer(input: FrontCliente): Promise<ClientCreateData> {
    const enderecos = input.enderecos?.map((e, idx) => ({
        cep: e.cep,
        logradouro: e.logradouro,
        numero: e.numero,
        bairro: e.bairro,
        cidade: e.cidade,
        uf: e.uf,
        complemento: e.complemento || undefined,
        tipo_endereco_id: 1,
        principal: idx === 0 ? 1 : 0,
    }));

    const escolas = input.dadosEscola ? [{
        tipo_escola: input.dadosEscola.tipoEscola,
        nome: input.dadosEscola.nome,
        telefone: input.dadosEscola.telefone,
        email: input.dadosEscola.email || '',
        enderecos: input.dadosEscola.endereco ? [{
            cep: input.dadosEscola.endereco.cep || '',
            logradouro: input.dadosEscola.endereco.logradouro || '',
            numero: input.dadosEscola.endereco.numero || '',
            bairro: input.dadosEscola.endereco.bairro || '',
            cidade: input.dadosEscola.endereco.cidade || '',
            uf: input.dadosEscola.endereco.uf || '',
            complemento: input.dadosEscola.endereco.complemento || undefined,
            tipo_endereco_id: 2,
            principal: 0,
        }]: undefined,
    }]: undefined;

    const responsaveis: ClientCreateData['responsaveis'] = [];

    responsaveis.push({
        nome: input.nomeMae,
        cpf: input.cpfMae,
        parentesco: 'mae',
        prioridade: 1,
    });

    if (input.nomePai && input.cpfPai) {
        responsaveis.push({
            nome: input.nomePai,
            cpf: input.cpfPai,
            telefone: input.telefonePai || '',
            parentesco: 'pai',
            prioridade: 0,
        });
    }

    if (input.maisDeUmPai === 'sim' && input.nomePai2 && input.cpfPai2) {
        responsaveis.push({
            nome: input.nomePai2,
            cpf: input.cpfPai2,
            telefone: input.telefonePai2 || '',
            parentesco: 'pai',
            prioridade: 0,
        });
    }

    let pagamentos: ClientCreateData['pagamentos'];
    const dadosPagamento = input.dadosPagamento;
    if (dadosPagamento) {
        const pagamento_contatos: { categoria?: string; tipo: string; valor:string }[] = [];
        const addContato = (
            categoria: string,
            tipo: string,
            valor?: string,
            mostrar: boolean = true,
        ) => {
            if (valor && mostrar) {
                pagamento_contatos.push({ categoria, tipo, valor });
            }
        };

        addContato('geral', 'telefone', dadosPagamento.telefone1);
        addContato('geral', 'telefone', dadosPagamento.telefone2, dadosPagamento.mostrarTelefone2 ?? false);
        addContato('geral', 'telefone', dadosPagamento.telefone3, dadosPagamento.mostrarTelefone3 ?? false);

        addContato('geral', 'email', dadosPagamento.email1);
        addContato('geral', 'email', dadosPagamento.email2, dadosPagamento.mostrarEmail2 ?? false);
        addContato('geral', 'email', dadosPagamento.email3, dadosPagamento.mostrarEmail3 ?? false);

        addContato('advogado', 'telefone', dadosPagamento.telefoneAdvogado1);
        addContato('advogado', 'telefone', dadosPagamento.telefoneAdvogado2, dadosPagamento.mostrarTelefoneAdvogado2 ?? false);
        addContato('advogado', 'telefone', dadosPagamento.telefoneAdvogado3, dadosPagamento.mostrarTelefoneAdvogado3 ?? false);

        addContato('advogado', 'email', dadosPagamento.emailAdvogado1);
        addContato('advogado', 'email', dadosPagamento.emailAdvogado2, dadosPagamento.mostrarEmailAdvogado2 ?? false);
        addContato('advogado', 'email', dadosPagamento.emailAdvogado3, dadosPagamento.mostrarEmailAdvogado3 ?? false);

        const pagamento: any = {
            nome: dadosPagamento.nomeTitular,
            numero_carteirinha: dadosPagamento.numeroCarteirinha,
            tipo_sistema: dadosPagamento.sistemaPagamento,
            pagamento_contatos,
        };

        if (dadosPagamento.sistemaPagamento === 'reembolso' && dadosPagamento.prazoReembolso) {
            pagamento.prazo_reembolso_dias = parseInt(dadosPagamento.prazoReembolso);
        }
        if (dadosPagamento.sistemaPagamento === 'liminar') {
            if (dadosPagamento.numeroProcesso) pagamento.numero_processo = dadosPagamento.numeroProcesso;
            if (dadosPagamento.nomeAdvogado) pagamento.nome_advogado = dadosPagamento.nomeAdvogado;
        }
        if (dadosPagamento.sistemaPagamento === 'particular' && dadosPagamento.valorSessao) {
            pagamento.valor_sessao = parseFloat(dadosPagamento.valorSessao);
        }

        pagamentos = [pagamento];
    }

    return {
        nome: input.nome,
        data_nascimento: asDate(input.dataNascimento),
        email_contato: input.emailContato,
        data_entrada: asDate(input.dataEntrada),
        perfil_acesso: 'cliente',
        enderecos,
        escolas,
        responsaveis,
        pagamentos,
    }
}