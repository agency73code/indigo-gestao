import type { 
  Paciente, 
  Terapeuta, 
  PatientTherapistLink, 
  LinkFilters
} from '../types';

// Mock de pacientes
export const mockPatients: Paciente[] = [
  {
    id: 'pac_001',
    nome: 'Ana Silva Santos',
    email: 'ana.santos@email.com',
    telefone: '(11) 9876-5432',
    dataNascimento: '2010-03-15',
    cpf: '123.456.789-01',
    endereco: {
      cep: '01310-100',
      rua: 'Av. Paulista, 1000',
      numero: '1000',
      complemento: 'Apto 101',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    responsavel: {
      nome: 'Maria Santos Silva',
      telefone: '(11) 9876-5432',
      email: 'maria.santos@email.com',
      parentesco: 'mãe'
    },
    observacoes: 'Paciente com TEA grau 1'
  },
  {
    id: 'pac_002', 
    nome: 'Carlos Eduardo Oliveira',
    email: 'carlos.oliveira@email.com',
    telefone: '(11) 8765-4321',
    dataNascimento: '2008-07-22',
    cpf: '987.654.321-09',
    endereco: {
      cep: '04567-890',
      rua: 'Rua das Flores, 250',
      numero: '250',
      bairro: 'Vila Madalena',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    responsavel: {
      nome: 'Roberto Oliveira',
      telefone: '(11) 8765-4321',
      email: 'roberto.oliveira@email.com',
      parentesco: 'pai'
    }
  },
  {
    id: 'pac_003',
    nome: 'Beatriz Costa Lima', 
    email: 'beatriz.lima@email.com',
    telefone: '(11) 7654-3210',
    dataNascimento: '2012-11-08',
    cpf: '456.789.123-45',
    endereco: {
      cep: '02345-678',
      rua: 'Rua do Sol, 180',
      numero: '180',
      bairro: 'Santana',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    responsavel: {
      nome: 'Julia Costa Lima',
      telefone: '(11) 7654-3210',
      email: 'julia.lima@email.com',
      parentesco: 'mãe'
    },
    observacoes: 'Acompanhamento semanal'
  },
  {
    id: 'pac_004',
    nome: 'Diego Almeida Santos',
    email: 'diego.santos@email.com',
    telefone: '(11) 6543-2109',
    dataNascimento: '2009-05-14',
    cpf: '789.123.456-78',
    endereco: {
      cep: '03456-789',
      rua: 'Av. Brasil, 500',
      numero: '500',
      bairro: 'Jardins',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    responsavel: {
      nome: 'Patricia Almeida',
      telefone: '(11) 6543-2109',
      email: 'patricia.almeida@email.com',
      parentesco: 'mãe'
    }
  },
  {
    id: 'pac_005',
    nome: 'Laura Ferreira Silva',
    email: 'laura.silva@email.com', 
    telefone: '(11) 5432-1098',
    dataNascimento: '2011-09-03',
    cpf: '321.654.987-12',
    endereco: {
      cep: '05678-901',
      rua: 'Rua da Alegria, 75',
      numero: '75',
      bairro: 'Moema',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    responsavel: {
      nome: 'Carlos Ferreira',
      telefone: '(11) 5432-1098',
      email: 'carlos.ferreira@email.com',
      parentesco: 'pai'
    },
    observacoes: 'Necessita acompanhamento familiar'
  }
];

// Mock de terapeutas
export const mockTherapists: Terapeuta[] = [
  {
    id: 'ter_001',
    nome: 'Dra. Mariana Rodrigues',
    email: 'mariana.rodrigues@indigo.com.br',
    emailIndigo: 'mariana@indigo.com.br',
    telefone: '(11) 9999-1111',
    celular: '(11) 9999-1111',
    cpf: '111.222.333-44',
    dataNascimento: '1985-04-12',
    possuiVeiculo: 'sim',
    placaVeiculo: 'ABC-1234',
    modeloVeiculo: 'Honda Civic',
    banco: 'Banco do Brasil',
    agencia: '1234-5',
    conta: '67890-1',
    chavePix: 'mariana@indigo.com.br',
    valorHoraAcordado: 120,
    professorUnindigo: 'nao',
    endereco: {
      cep: '01234-567',
      rua: 'Rua dos Terapeutas, 100',
      numero: '100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    dadosProfissionais: [{
      areaAtuacao: 'Análise do Comportamento',
      cargo: 'Psicóloga',
      numeroConselho: 'CRP 06/123456'
    }],
    dataInicio: '2022-01-15',
    formacao: {
      graduacao: 'Psicologia',
      instituicaoGraduacao: 'USP',
      anoFormatura: '2008',
      posGraduacoes: [{
        tipo: 'lato',
        curso: 'Especialização em ABA',
        instituicao: 'PUC-SP',
        conclusao: '2010-12-15'
      }]
    },
    arquivos: {}
  },
  {
    id: 'ter_002',
    nome: 'Dr. João Pedro Silva',
    email: 'joao.silva@indigo.com.br',
    emailIndigo: 'joao@indigo.com.br',
    telefone: '(11) 8888-2222',
    celular: '(11) 8888-2222',
    cpf: '222.333.444-55',
    dataNascimento: '1980-08-25',
    possuiVeiculo: 'sim',
    placaVeiculo: 'DEF-5678',
    modeloVeiculo: 'Toyota Corolla',
    banco: 'Itaú',
    agencia: '5678-9',
    conta: '12345-6',
    chavePix: '(11) 8888-2222',
    valorHoraAcordado: 110,
    professorUnindigo: 'sim',
    disciplinaUniindigo: 'Fundamentos de ABA',
    endereco: {
      cep: '02345-678',
      rua: 'Av. dos Profissionais, 200',
      numero: '200',
      bairro: 'Vila Nova',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    dadosProfissionais: [{
      areaAtuacao: 'Terapia Comportamental',
      cargo: 'Psicólogo',
      numeroConselho: 'CRP 06/789012'
    }],
    dataInicio: '2021-03-10',
    formacao: {
      graduacao: 'Psicologia',
      instituicaoGraduacao: 'PUC-SP',
      anoFormatura: '2005'
    },
    arquivos: {}
  },
  {
    id: 'ter_003',
    nome: 'Dra. Ana Carolina Mendes',
    email: 'ana.mendes@indigo.com.br',
    emailIndigo: 'ana.mendes@indigo.com.br',
    telefone: '(11) 7777-3333',
    celular: '(11) 7777-3333',
    cpf: '333.444.555-66',
    dataNascimento: '1988-12-03',
    possuiVeiculo: 'nao',
    banco: 'Bradesco',
    agencia: '9876-5',
    conta: '54321-0',
    chavePix: 'ana.mendes@indigo.com.br',
    valorHoraAcordado: 130,
    professorUnindigo: 'nao',
    endereco: {
      cep: '03456-789',
      rua: 'Rua da Esperança, 300',
      numero: '300',
      bairro: 'Ipiranga',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    dadosProfissionais: [{
      areaAtuacao: 'Intervenção Precoce',
      cargo: 'Terapeuta Ocupacional',
      numeroConselho: 'CREFITO-3/12345'
    }],
    dataInicio: '2022-08-20',
    formacao: {
      graduacao: 'Terapia Ocupacional',
      instituicaoGraduacao: 'UNIFESP',
      anoFormatura: '2012'
    },
    arquivos: {}
  },
  {
    id: 'ter_004',
    nome: 'Dr. Rafael Santos Costa',
    email: 'rafael.costa@indigo.com.br',
    emailIndigo: 'rafael@indigo.com.br', 
    telefone: '(11) 6666-4444',
    celular: '(11) 6666-4444',
    cpf: '444.555.666-77',
    dataNascimento: '1983-06-18',
    possuiVeiculo: 'sim',
    placaVeiculo: 'GHI-9012',
    modeloVeiculo: 'Volkswagen Polo',
    banco: 'Santander',
    agencia: '1357-2',
    conta: '97531-8',
    chavePix: '444.555.666-77',
    valorHoraAcordado: 115,
    professorUnindigo: 'nao',
    endereco: {
      cep: '04567-890',
      rua: 'Av. Nova, 400',
      numero: '400',
      bairro: 'Brooklin',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    dadosProfissionais: [{
      areaAtuacao: 'Análise do Comportamento',
      cargo: 'Psicólogo',
      numeroConselho: 'CRP 06/345678'
    }],
    dataInicio: '2023-02-01',
    formacao: {
      graduacao: 'Psicologia',
      instituicaoGraduacao: 'Mackenzie',
      anoFormatura: '2007'
    },
    arquivos: {}
  },
  {
    id: 'ter_005',
    nome: 'Dra. Camila Alves Pereira',
    email: 'camila.pereira@indigo.com.br',
    emailIndigo: 'camila@indigo.com.br',
    telefone: '(11) 5555-5555',
    celular: '(11) 5555-5555',
    cpf: '555.666.777-88',
    dataNascimento: '1990-01-28',
    possuiVeiculo: 'nao',
    banco: 'Caixa Econômica',
    agencia: '2468-1',
    conta: '13579-2',
    chavePix: '(11) 5555-5555',
    valorHoraAcordado: 125,
    professorUnindigo: 'sim',
    disciplinaUniindigo: 'Desenvolvimento Infantil',
    endereco: {
      cep: '05678-901',
      rua: 'Rua das Palmeiras, 500',
      numero: '500',
      bairro: 'Vila Olímpia',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    dadosProfissionais: [{
      areaAtuacao: 'Desenvolvimento Infantil',
      cargo: 'Psicóloga',
      numeroConselho: 'CRP 06/567890'
    }],
    dataInicio: '2023-05-15',
    formacao: {
      graduacao: 'Psicologia',
      instituicaoGraduacao: 'UNIP',
      anoFormatura: '2014'
    },
    arquivos: {}
  }
];

// Mock de vínculos
export const mockLinks: PatientTherapistLink[] = [
  {
    id: 'link_001',
    patientId: 'pac_001',
    therapistId: 'ter_001',
    role: 'responsible',
    startDate: '2024-01-15',
    endDate: null,
    status: 'active',
    notes: 'Primeira avaliação realizada em janeiro',
    actuationArea: 'Fonoaudiologia',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 'link_002',
    patientId: 'pac_001',
    therapistId: 'ter_003',
    role: 'co',
    startDate: '2024-02-01',
    endDate: null,
    status: 'active',
    notes: 'Suporte em terapia ocupacional',
    actuationArea: 'Fonoaudiologia',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 'link_003',
    patientId: 'pac_002',
    therapistId: 'ter_002',
    role: 'responsible',
    startDate: '2024-01-20',
    endDate: null,
    status: 'active',
    notes: 'Foco em comportamentos adaptativos',
    actuationArea: 'Fonoaudiologia',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 'link_004',
    patientId: 'pac_003',
    therapistId: 'ter_001',
    role: 'responsible',
    startDate: '2024-02-10',
    endDate: null,
    status: 'active',
    notes: 'Programa de comunicação alternativa',
    actuationArea: 'Fonoaudiologia',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10'
  },
  {
    id: 'link_005',
    patientId: 'pac_004',
    therapistId: 'ter_004',
    role: 'responsible',
    startDate: '2024-03-01',
    endDate: null,
    status: 'active',
    notes: 'Intervenção comportamental',
    actuationArea: 'Fonoaudiologia',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01'
  },
  {
    id: 'link_006',
    patientId: 'pac_004',
    therapistId: 'ter_005',
    role: 'co',
    startDate: '2024-03-15',
    endDate: null,
    status: 'active',
    notes: 'Apoio no desenvolvimento social',
    actuationArea: 'Fonoaudiologia',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15'
  },
  {
    id: 'link_007',
    patientId: 'pac_005',
    therapistId: 'ter_002',
    role: 'responsible',
    startDate: '2023-11-01',
    endDate: '2024-02-29',
    status: 'ended',
    notes: 'Programa concluído com sucesso',
    actuationArea: 'Fonoaudiologia',
    createdAt: '2023-11-01',
    updatedAt: '2024-02-29'
  },
  {
    id: 'link_008',
    patientId: 'pac_005',
    therapistId: 'ter_005',
    role: 'responsible',
    startDate: '2024-03-01',
    endDate: null,
    status: 'active',
    notes: 'Continuidade do programa anterior',
    actuationArea: 'Fonoaudiologia',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01'
  }
];

// Helper: remover acentos e normalizar texto para busca
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Busca pacientes por nome (case/acentos insensitive)
 */
export function searchPatientsByName(patients: Paciente[], query: string): Paciente[] {
  if (!query.trim()) {
    return patients.slice(0, 10); // Retorna primeiros 10 se não há busca
  }
  
  const normalizedQuery = normalizeText(query);
  
  return patients.filter(patient => 
    normalizeText(patient.nome).includes(normalizedQuery)
  ).slice(0, 10); // Limita a 10 resultados
}

/**
 * Busca terapeutas por nome (case/acentos insensitive)
 */
export function searchTherapistsByName(therapists: Terapeuta[], query: string): Terapeuta[] {
  if (!query.trim()) {
    return therapists.slice(0, 10); // Retorna primeiros 10 se não há busca
  }
  
  const normalizedQuery = normalizeText(query);
  
  return therapists.filter(therapist => 
    normalizeText(therapist.nome).includes(normalizedQuery)
  ).slice(0, 10); // Limita a 10 resultados
}

/**
 * Filtra e ordena vínculos conforme filtros
 */
export function filterAndSortLinks(
  links: PatientTherapistLink[], 
  filters: LinkFilters
): PatientTherapistLink[] {
  let filteredLinks = [...links];
  
  // Filtro por status
  if (filters.status && filters.status !== 'all') {
    filteredLinks = filteredLinks.filter(link => link.status === filters.status);
  }
  
  // Busca por nome (paciente ou terapeuta)
  if (filters.q && filters.q.trim()) {
    const normalizedQuery = normalizeText(filters.q);
    
    filteredLinks = filteredLinks.filter(link => {
      const patient = mockPatients.find(p => p.id === link.patientId);
      const therapist = mockTherapists.find(t => t.id === link.therapistId);
      
      const patientMatch = patient ? normalizeText(patient.nome).includes(normalizedQuery) : false;
      const therapistMatch = therapist ? normalizeText(therapist.nome).includes(normalizedQuery) : false;
      
      return patientMatch || therapistMatch;
    });
  }
  
  // Ordenação
  if (filters.orderBy === 'alpha') {
    // Ordena alfabeticamente por nome do paciente
    filteredLinks.sort((a, b) => {
      const patientA = mockPatients.find(p => p.id === a.patientId);
      const patientB = mockPatients.find(p => p.id === b.patientId);
      
      const nameA = patientA?.nome || '';
      const nameB = patientB?.nome || '';
      
      return nameA.localeCompare(nameB, 'pt-BR');
    });
  } else {
    // Ordena por mais recente (padrão)
    filteredLinks.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }
  
  // Paginação simples
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return filteredLinks.slice(startIndex, endIndex);
}