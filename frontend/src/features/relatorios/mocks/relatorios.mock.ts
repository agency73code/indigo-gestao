import type { Paciente, Terapeuta, SavedReport } from '../types';

export const mockPatients: Paciente[] = [
  {
    id: 'pac_001',
    nome: 'Maria Silva Santos',
    dataNascimento: '1993-03-15',
    avatarUrl: null,
    responsavelNome: 'José Silva',
  },
];

export const mockTherapists: Terapeuta[] = [];

export const mockReports: SavedReport[] = [];