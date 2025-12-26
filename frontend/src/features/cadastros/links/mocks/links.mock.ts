import type { ClientListItem, Terapeuta, PatientTherapistLink, TherapistSupervisionLink, LinkFilters } from '../types';

// Mock de pacientes
export const mockPatients: ClientListItem[] = [
  {
    id: 'pac_001',
    nome: 'Ana Silva Santos',
    // email: 'ana.santos@email.com',
    // telefone: '(11) 9876-5432',
    dataNascimento: '2010-03-15',
    // cpf: '123.456.789-01',
    // endereco: {
    //   cep: '01310-100',
    //   rua: 'Av. Paulista, 1000',
    //   numero: '1000',
    //   complemento: 'Apto 101',
    //   bairro: 'Bela Vista',
    //   cidade: 'São Paulo',
    //   estado: 'SP'
    // },
    // responsavel: {
    //   nome: 'Maria Santos Silva',
    //   telefone: '(11) 9876-5432',
    //   email: 'maria.santos@email.com',
    //   parentesco: 'mãe'
    // },
    // observacoes: 'Paciente com TEA grau 1'
    avatarUrl: null,
    responsavelNome: 'Maria Santos Silva',
  },
  {
    id: 'pac_002',
    nome: 'Carlos Eduardo Oliveira',
    // email: 'carlos.oliveira@email.com',
    // telefone: '(11) 8765-4321',
    dataNascimento: '2008-07-22',
    // cpf: '987.654.321-09',
    // endereco: {
    //   cep: '04567-890',
    //   rua: 'Rua das Flores, 250',
    //   numero: '250',
    //   bairro: 'Vila Madalena',
    //   cidade: 'São Paulo',
    //   estado: 'SP'
    // },
    // responsavel: {
    //   nome: 'Roberto Oliveira',
    //   telefone: '(11) 8765-4321',
    //   email: 'roberto.oliveira@email.com',
    //   parentesco: 'pai'
    // }
    avatarUrl: null,
    responsavelNome: 'João Oliveira',
  },
];

export const mockTherapists: Terapeuta[] = [];
export const mockSupervisionLinks: TherapistSupervisionLink[] = [];

export function searchPatientsByName(patients: ClientListItem[], query: string): ClientListItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return patients;

  return patients.filter((patient) => patient.nome.toLowerCase().includes(normalizedQuery));
}

export function filterLinksByFilters(
  links: PatientTherapistLink[],
  supervisionLinks: TherapistSupervisionLink[],
  _filters: LinkFilters
) {
  return { links, supervisionLinks }
}
