import type { Therapist } from '../types/consultas.types';

export const therapistsMock: Therapist[] = [
    {
        id: '1',
        nome: 'Dr. Ana Paula Silva',
        email: 'ana.silva@indigo.com.br',
        telefone: '(11) 98765-4321',
        status: 'ATIVO',
        especialidade: 'Psicologia Clínica',
        conselho: 'CRP',
        registroConselho: '12345-SP',
        avatarUrl: undefined,
        pessoa: {
            cpf: '123.456.789-00',
            dataNascimento: '1985-03-15',
            genero: 'Feminino',
            observacoes: 'Especialista em terapia cognitivo-comportamental'
        },
        endereco: {
            cep: '01234-567',
            logradouro: 'Rua das Flores, 123',
            numero: '123',
            complemento: 'Apto 45',
            bairro: 'Centro',
            cidade: 'São Paulo',
            uf: 'SP'
        },
        profissional: {
            cargaHorariaSemanal: 40,
            atendeConvenio: true,
            especialidades: ['Terapia Cognitivo-Comportamental', 'Psicologia do Desenvolvimento'],
            valorConsulta: 150,
            formasAtendimento: ['Presencial', 'Online']
        },
        formacao: [
            {
                curso: 'Graduação em Psicologia',
                instituicao: 'Universidade de São Paulo',
                ano: 2008
            },
            {
                curso: 'Mestrado em Psicologia Clínica',
                instituicao: 'PUC-SP',
                ano: 2011
            }
        ],
        arquivos: [
            {
                id: '1',
                nome: 'diploma_graduacao.pdf',
                tipo: 'application/pdf',
                tamanho: 2048576,
                data: '2024-01-15'
            },
            {
                id: '2',
                nome: 'registro_crp.pdf',
                tipo: 'application/pdf',
                tamanho: 1024768,
                data: '2024-01-15'
            }
        ],
        cnpj: '12.345.678/0001-90'
    },
    {
        id: '2',
        nome: 'Dr. Carlos Eduardo Santos',
        email: 'carlos.santos@indigo.com.br',
        telefone: '(11) 91234-5678',
        status: 'ATIVO',
        especialidade: 'Psiquiatria',
        conselho: 'CRM',
        registroConselho: '54321-SP',
        pessoa: {
            cpf: '987.654.321-00',
            dataNascimento: '1978-08-22',
            genero: 'Masculino',
            observacoes: 'Especialista em transtornos de ansiedade e depressão'
        },
        endereco: {
            cep: '04567-890',
            logradouro: 'Av. Paulista, 1000',
            numero: '1000',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            uf: 'SP'
        },
        profissional: {
            cargaHorariaSemanal: 30,
            atendeConvenio: false,
            especialidades: ['Psiquiatria Clínica', 'Transtornos de Humor'],
            valorConsulta: 200,
            formasAtendimento: ['Presencial']
        },
        formacao: [
            {
                curso: 'Graduação em Medicina',
                instituicao: 'Faculdade de Medicina da USP',
                ano: 2002
            },
            {
                curso: 'Residência em Psiquiatria',
                instituicao: 'Hospital das Clínicas - USP',
                ano: 2006
            }
        ],
        arquivos: [
            {
                id: '3',
                nome: 'diploma_medicina.pdf',
                tipo: 'application/pdf',
                tamanho: 3072000,
                data: '2024-01-10'
            }
        ],
        cnpj: '98.765.432/0001-10'
    },
    {
        id: '3',
        nome: 'Dra. Maria Fernanda Costa',
        email: 'maria.costa@indigo.com.br',
        telefone: '(11) 95555-7777',
        status: 'INATIVO',
        especialidade: 'Terapia Familiar',
        conselho: 'CRP',
        registroConselho: '67890-SP',
        pessoa: {
            cpf: '456.789.123-00',
            dataNascimento: '1990-12-05',
            genero: 'Feminino',
            observacoes: 'Especialista em terapia sistêmica familiar'
        },
        endereco: {
            cep: '02345-678',
            logradouro: 'Rua Augusta, 500',
            numero: '500',
            bairro: 'Consolação',
            cidade: 'São Paulo',
            uf: 'SP'
        },
        profissional: {
            cargaHorariaSemanal: 20,
            atendeConvenio: true,
            especialidades: ['Terapia Sistêmica', 'Psicologia Infantil'],
            valorConsulta: 120,
            formasAtendimento: ['Presencial', 'Online']
        },
        formacao: [
            {
                curso: 'Graduação em Psicologia',
                instituicao: 'Universidade Mackenzie',
                ano: 2013
            }
        ],
        arquivos: [],
        cnpj: '11.222.333/0001-44'
    },
    {
        id: '4',
        nome: 'Dr. Roberto Almeida',
        email: 'roberto.almeida@indigo.com.br',
        telefone: '(11) 96666-8888',
        status: 'ATIVO',
        especialidade: 'Neuropsicologia',
        conselho: 'CRP',
        registroConselho: '13579-SP',
        pessoa: {
            cpf: '789.123.456-00',
            dataNascimento: '1982-06-30',
            genero: 'Masculino',
            observacoes: 'Especialista em avaliação neuropsicológica'
        },
        endereco: {
            cep: '03456-789',
            logradouro: 'Rua Oscar Freire, 200',
            numero: '200',
            bairro: 'Jardins',
            cidade: 'São Paulo',
            uf: 'SP'
        },
        profissional: {
            cargaHorariaSemanal: 35,
            atendeConvenio: true,
            especialidades: ['Neuropsicologia', 'Reabilitação Cognitiva'],
            valorConsulta: 180,
            formasAtendimento: ['Presencial']
        },
        formacao: [
            {
                curso: 'Graduação em Psicologia',
                instituicao: 'PUC-SP',
                ano: 2005
            },
            {
                curso: 'Especialização em Neuropsicologia',
                instituicao: 'UNIFESP',
                ano: 2008
            }
        ],
        arquivos: [
            {
                id: '4',
                nome: 'certificado_neuropsicologia.pdf',
                tipo: 'application/pdf',
                tamanho: 1536000,
                data: '2024-01-08'
            }
        ],
        cnpj: '22.333.444/0001-55'
    }
];

// TODO: integrar API - substituir por service real
export const getTherapists = async (): Promise<Therapist[]> => {
    // Simular delay de API
    return new Promise((resolve) => {
        setTimeout(() => resolve(therapistsMock), 800);
    });
};

export const getTherapistById = async (id: string): Promise<Therapist | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const therapist = therapistsMock.find(t => t.id === id) || null;
            resolve(therapist);
        }, 300);
    });
};
