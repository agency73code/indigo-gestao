import { fetchClients, fetchTherapists } from '../api';
import type { Patient, Therapist, CreateProgramInput } from './types';

export async function fetchPatientById(id: string): Promise<Patient> {
    const res = await fetch(`/api/ocp/clients/${id}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error(`Erro ao buscar cliente: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data as Patient;
}

export async function fetchTherapistById(_id: string): Promise<Therapist> {
    return { id: '1', name: 'kaio', photoUrl: null }
}

export async function createProgram(payload: CreateProgramInput): Promise<{ id: string }> {
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
            stimuliApplicationDescription: payload.stimuliApplicationDescription,
            shortTermGoalDescription: payload.shortTermGoalDescription,
            criteria: payload.criteria,
            notes: payload.notes,
            stimuli: payload.stimuli,
            prazoInicio: payload.prazoInicio,
            prazoFim: payload.prazoFim,
        }),
    });

    if (!res.ok) {
    let errorMessage = `Erro ao criar programa (${res.status})`;

    try {
        const data = await res.json();
        if (typeof data?.message === 'string') {
        errorMessage = data.message;
        }
    } catch {
        // Se não for JSON, tenta pegar texto
        const text = await res.text();
        if (text) {
        errorMessage = text;
        }
    }

    throw new Error(errorMessage);
    }

    const json = await res.json();
    return { id: String(json.data.id) };
}

// Função para buscar pacientes (reutilizando da consulta se disponível)
export async function searchPatients(q?: string): Promise<Patient[]> {
    return await fetchClients(q);
}

// Função para buscar terapeutas 
export async function searchTherapists(query?: string): Promise<Therapist[]> {
    const result = await fetchTherapists(query);
    return result;
}