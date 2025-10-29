// MOCKS DE USO LOCAL EM DEV. NÃO COMMITAR EM PRODUÇÃO.
import type { Patient } from '../types';

export const mockPatients: Patient[] = [
    { id: '1', name: 'Ana Silva Santos', responsible: 'Maria Santos', age: 8, birthDate: '2017-03-15' },
    { id: '2', name: 'João Pedro Costa', responsible: 'José Costa', age: 12, birthDate: '2013-07-22' },
    { id: '3', name: 'Luiza Oliveira', responsible: 'Carlos Oliveira', age: 6, birthDate: '2019-11-08' },
    { id: '4', name: 'Miguel Ferreira', responsible: 'Paula Ferreira', age: 10, birthDate: '2015-05-30' },
];
