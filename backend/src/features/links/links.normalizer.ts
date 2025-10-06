import * as LinkTypes from './links.types.js';

export async function getAllClients(dto: LinkTypes.DBCliente[]) {
    return dto.map(d => ({
        id: d.id,
        nome: d.nome,
        email: null,
        telefone: null,
        dataNascimento: d.dataNascimento,
        cpf: null,
        endereco: {
            cep: null,
            rua: null,
            numero: null,
            complemento: null,
            bairro: null,
            cidade: null,
            estado: null,
        },
        responsavel: {
            nome: null,
            telefone: null,
            email: null,
            parentesco: null,
        },
        observacoes: null,
    }))
}