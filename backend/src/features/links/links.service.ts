import { prisma } from '../../config/database.js'

export async function getAllClients() {
    return prisma.cliente.findMany({
        select: {
            id: true,
            nome: true,
            emailContato: true,
            dataNascimento: true,
            cpf: true,
            status: true,
            cuidadores: {
                select: {
                    nome: true,
                    telefone: true,
                    email: true,
                    relacao: true,
                    descricaoRelacao: true,
                },
                orderBy: { id: 'asc' },
            },
            enderecos: {
                select: {
                    residenciaDe: true,
                    outroResidencia: true,
                    endereco: {
                        select: {
                            cep: true,
                            rua: true,
                            numero: true,
                            bairro: true,
                            cidade: true,
                            uf: true,
                            complemento: true,
                        },
                    },
                },
                orderBy: { id: 'asc' },
            },
        },
        orderBy: { nome: 'asc' },
    });
}

export async function getAllTherapists() {
    return prisma.terapeuta.findMany({
        select: {
            id: true,
            nome: true,
            email: true,
            email_indigo: true,
            telefone: true,
            celular: true,
            cpf: true,
            data_nascimento: true,
            possui_veiculo: true,
            placa_veiculo: true,
            modelo_veiculo: true,
            banco: true,
            agencia: true,
            conta: true,
            chave_pix: true,
            valor_hora: true,
            professor_uni: true,
            data_entrada: true,
            data_saida: true,
            atividade: true,
            endereco: {
                select: {
                    cep: true,
                    rua: true,
                    numero: true,
                    bairro: true,
                    cidade: true,
                    uf: true,
                    complemento: true,
                },
            },
            registro_profissional: {
                select: {
                    area_atuacao: true,
                    cargo: true,
                    numero_conselho: true,
                },
            },
            formacao: {
                select: {
                    graduacao: true,
                    instituicao_graduacao: true,
                    ano_formatura: true,
                    participacao_congressos: true,
                    publicacoes_descricao: true,
                    pos_graduacao: {
                        select: {
                            tipo: true,
                            curso: true,
                            instituicao: true,
                            conclusao: true,
                        },
                    },
                },
            },
            pessoa_juridica: {
                select: {
                    cnpj: true,
                    razao_social: true,
                    endereco: {
                        select: {
                            cep: true,
                            rua: true,
                            numero: true,
                            bairro: true,
                            cidade: true,
                            uf: true,
                            complemento: true,
                        },
                    },
                },
            },
        },
        orderBy: { nome: 'asc' },
    });
}

export async function getAllLinks() {
    return prisma.terapeuta_cliente.findMany({
        select: {
            id: true,
            terapeuta_id: true,
            cliente_id: true,
            papel: true,
            status: true,
            data_inicio: true,
            data_fim: true,
            observacoes: true,
            atuacao_coterapeuta: true,
            criado_em: true,
            atualizado_em: true,
        },
        orderBy: { atualizado_em: 'desc' },
    });
}