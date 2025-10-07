import type { Patient } from '../types/consultas.types';

export const patientsMock: Patient[] = [
    {
        id: '1',
        nome: 'João Silva Santos',
        email: 'joao.santos@email.com',
        telefone: '(11) 99999-1111',
        responsavel: undefined,
        status: 'ATIVO',
        avatarUrl: undefined,
        pessoa: {
            cpf: '111.222.333-44',
            dataNascimento: '1995-04-10',
            genero: 'Masculino',
            observacoes: 'Paciente em acompanhamento para ansiedade'
        },
        endereco: {
            cep: '01234-567',
            logradouro: 'Rua das Palmeiras, 456',
            numero: '456',
            complemento: 'Casa 2',
            bairro: 'Vila Madalena',
            cidade: 'São Paulo',
            uf: 'SP'
        },
        arquivos: [
            {
                id: '1',
                nome: 'exame_admissional.pdf',
                tipo: 'application/pdf',
                tamanho: 1024000,
                data: '2024-01-20'
            }
        ]
    },
    {
        id: '2',
        nome: 'Maria Eduarda Oliveira',
        email: 'maria.eduarda@email.com',
        telefone: '(11) 88888-2222',
        responsavel: 'Paula Oliveira (mãe)',
        status: 'ATIVO',
        pessoa: {
            cpf: '222.333.444-55',
            dataNascimento: '2010-09-25',
            genero: 'Feminino',
            observacoes: 'Paciente menor de idade, acompanhamento psicopedagógico'
        },
        endereco: {
            cep: '04567-890',
            logradouro: 'Av. Rebouças, 1200',
            numero: '1200',
            complemento: 'Apto 78',
            bairro: 'Pinheiros',
            cidade: 'São Paulo',
            uf: 'SP'
        },
        arquivos: [
            {
                id: '2',
                nome: 'relatorio_escolar.pdf',
                tipo: 'application/pdf',
                tamanho: 2048000,
                data: '2024-01-18'
            },
            {
                id: '3',
                nome: 'autorizacao_responsavel.pdf',
                tipo: 'application/pdf',
                tamanho: 512000,
                data: '2024-01-15'
            }
        ]
    },
    {
        id: '3',
        nome: 'Carlos Roberto Lima',
        email: 'carlos.lima@email.com',
        telefone: '(11) 77777-3333',
        status: 'INATIVO',
        pessoa: {
            cpf: '333.444.555-66',
            dataNascimento: '1980-12-03',
            genero: 'Masculino',
            observacoes: 'Concluiu tratamento com sucesso'
        },
        endereco: {
            cep: '02345-678',
            logradouro: 'Rua Teodoro Sampaio, 800',
            numero: '800',
            bairro: 'Pinheiros',
            cidade: 'São Paulo',
            uf: 'SP'
        },
        arquivos: []
    },
    {
        id: '4',
        nome: 'Ana Beatriz Costa',
        email: 'ana.beatriz@email.com',
        telefone: '(11) 66666-4444',
        status: 'ATIVO',
        pessoa: {
            cpf: '444.555.666-77',
            dataNascimento: '1992-07-18',
            genero: 'Feminino',
            observacoes: 'Acompanhamento para depressão pós-parto'
        },
        endereco: {
            cep: '05678-901',
            logradouro: 'Rua Haddock Lobo, 300',
            numero: '300',
            complemento: 'Conjunto 12',
            bairro: 'Cerqueira César',
            cidade: 'São Paulo',
            uf: 'SP'
        },
        arquivos: [
            {
                id: '4',
                nome: 'historico_medico.pdf',
                tipo: 'application/pdf',
                tamanho: 3072000,
                data: '2024-01-12'
            }
        ]
    },
    {
        id: '5',
        nome: 'Pedro Henrique Alves',
        email: 'pedro.alves@email.com',
        telefone: '(11) 55555-5555',
        responsavel: 'Sandra Alves (mãe)',
        status: 'ATIVO',
        pessoa: {
            cpf: '555.666.777-88',
            dataNascimento: '2008-02-14',
            genero: 'Masculino',
            observacoes: 'Cliente com TDAH, em acompanhamento multidisciplinar'
        },
        endereco: {
            cep: '06789-012',
            logradouro: 'Rua Consolação, 1500',
            numero: '1500',
            bairro: 'Consolação',
            cidade: 'São Paulo',
            uf: 'SP'
        },
        arquivos: [
            {
                id: '5',
                nome: 'laudo_neuropsicologico.pdf',
                tipo: 'application/pdf',
                tamanho: 4096000,
                data: '2024-01-10'
            }
        ]
    }
];

// TODO: integrar API - substituir por service real
export const getPatients = async (): Promise<Patient[]> => {
    // Simular delay de API
    return new Promise((resolve) => {
        setTimeout(() => resolve(patientsMock), 800);
    });
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const patient = patientsMock.find(p => p.id === id) || null;
            resolve(patient);
        }, 300);
    });
};
