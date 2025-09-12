// MOCKS DE USO LOCAL EM DEV. NÃO COMMITAR EM PRODUÇÃO.
import type { Patient } from '../types';

export const mockPatients: Patient[] = [
    { id: '1', name: 'Ana Silva Santos', responsible: 'Maria Santos', age: 8 },
    { id: '2', name: 'João Pedro Costa', responsible: 'José Costa', age: 12 },
    { id: '3', name: 'Luiza Oliveira', responsible: 'Carlos Oliveira', age: 6 },
    { id: '4', name: 'Miguel Ferreira', responsible: 'Paula Ferreira', age: 10 },
];
