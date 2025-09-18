import { fetchClients } from '../api';
import type { Patient, Therapist, CreateProgramInput } from './types';

// Flag para usar mocks locais durante desenvolvimento
const USE_LOCAL_MOCKS = true;

// Mock de dados para desenvolvimento
const MOCK_PATIENTS: Patient[] = [
    {
        id: '1',
        name: 'Ana Silva Santos',
        guardianName: 'Maria Santos',
        age: 8,
        photoUrl: null,
    },
    {
        id: '2', 
        name: 'João Pedro Silva',
        guardianName: 'Carlos Silva',
        age: 12,
        photoUrl: null,
    },
    {
        id: '3',
        name: 'Sofia Costa Lima',
        guardianName: 'Fernanda Costa',
        age: 6,
        photoUrl: null,
    },
];

const MOCK_THERAPISTS: Therapist[] = [
    {
        id: '1',
        name: 'Dra. Amanda Oliveira',
        photoUrl: null,
    },
    {
        id: '2',
        name: 'Dr. Rafael Santos',
        photoUrl: null,
    },
    {
        id: '3',
        name: 'Dra. Carolina Ferreira',
        photoUrl: null,
    },
];

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchPatientById(id: string): Promise<Patient> {
    if (USE_LOCAL_MOCKS) {
        await delay(300);
        const patient = MOCK_PATIENTS.find(p => p.id === id);
        if (!patient) {
            throw new Error(`Paciente com ID ${id} não encontrado`);
        }
        return patient;
    }
    
    // TODO: Implementar chamada real da API
    throw new Error('API integration not implemented yet');
}

export async function fetchTherapistById(id: string): Promise<Therapist> {
    if (USE_LOCAL_MOCKS) {
        await delay(300);
        const therapist = MOCK_THERAPISTS.find(t => t.id === id);
        if (!therapist) {
            throw new Error(`Terapeuta com ID ${id} não encontrado`);
        }
        return therapist;
    }
    
    // TODO: Implementar chamada real da API
    throw new Error('API integration not implemented yet');
}

export async function createProgram(payload: CreateProgramInput): Promise<{ id: string }> {
    try {
        const res = await fetch('/api/ocp/create', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId: payload.patientId,
                therapistId: payload.therapistId,
                name: payload.name,
                goalTitle: payload.goalTitle,
                goalDescription: payload.goalDescription,
                criteria: payload.criteria,
                notes: payload.notes,
                stimuli: payload.stimuli,
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Erro ao criar programa (${res.status}): ${text}`);
        }

        const json = await res.json();
        return { id: String(json.data.id) };
    } catch {
        if (USE_LOCAL_MOCKS) {
            await delay(1000);
            
            // Simula validação básica
            if (!payload.patientId || !payload.therapistId || !payload.goalTitle) {
                throw new Error('Campos obrigatórios não preenchidos');
            }
            
            if (payload.stimuli.length === 0) {
                throw new Error('Pelo menos um estímulo é obrigatório');
            }
            
            // Simula erro ocasional para teste
            if (Math.random() < 0.1) {
                throw new Error('Erro interno do servidor. Tente novamente.');
            }
            
            const programId = `programa_${Date.now()}`;
            console.log('Mock: Programa criado com sucesso:', { id: programId, ...payload });
            
            return { id: programId };
        }
    }
    // TODO: Implementar chamada real da API
    throw new Error('API integration not implemented yet');
}

// Função para buscar pacientes (reutilizando da consulta se disponível)
export async function searchPatients(q?: string): Promise<Patient[]> {
    try {
        return await fetchClients(q);
    } catch {
        if (USE_LOCAL_MOCKS) {
            await delay(200);
            
            if (!q) return MOCK_PATIENTS;
            
            const searchTerm = q.toLowerCase();
            return MOCK_PATIENTS.filter(patient => 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.guardianName?.toLowerCase().includes(searchTerm)
            );
        }
        
        throw new Error('Erro ao buscar pacientes');
    }
}

// Função para buscar terapeutas 
export async function searchTherapists(query?: string): Promise<Therapist[]> {
    if (USE_LOCAL_MOCKS) {
        await delay(200);
        
        if (!query) return MOCK_THERAPISTS;
        
        const searchTerm = query.toLowerCase();
        return MOCK_THERAPISTS.filter(therapist => 
            therapist.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // TODO: Integrar com serviço real de busca de terapeutas
    throw new Error('API integration not implemented yet');
}