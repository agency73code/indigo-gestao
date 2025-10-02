import type {
  Paciente, 
  Terapeuta,
  PatientTherapistLink, 
  CreateLinkInput, 
  UpdateLinkInput,
  TransferResponsibleInput, 
  LinkFilters
} from '../types';
import { 
  mockPatients, 
  mockTherapists, 
  mockLinks,
  searchPatientsByName,
  searchTherapistsByName,
  filterAndSortLinks 
} from '../mocks/links.mock.js';

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Busca pacientes por nome
 */
export async function searchPatients(q: string): Promise<Paciente[]> {
  await delay(300);
  console.log('teste')
  return searchPatientsByName(mockPatients, q);
}

/**
 * Busca terapeutas por nome
 */
export async function searchTherapists(q: string): Promise<Terapeuta[]> {
  await delay(300);
  return searchTherapistsByName(mockTherapists, q);
}

/**
 * Lista vínculos por paciente com filtros
 */
export async function listLinksByPatient(filters: LinkFilters): Promise<PatientTherapistLink[]> {
  await delay(500);
  return filterAndSortLinks(mockLinks, { ...filters, viewBy: 'patient' });
}

/**
 * Lista vínculos por terapeuta com filtros
 */
export async function listLinksByTherapist(filters: LinkFilters): Promise<PatientTherapistLink[]> {
  await delay(500);
  return filterAndSortLinks(mockLinks, { ...filters, viewBy: 'therapist' });
}

/**
 * Cria novo vínculo
 * Regras: Apenas 1 responsible ativo por paciente
 */
export async function createLink(input: CreateLinkInput): Promise<PatientTherapistLink> {
  await delay(800);
  
  // Verifica se já existe um responsável ativo para o paciente
  if (input.role === 'responsible') {
    const existingResponsible = mockLinks.find((link: PatientTherapistLink) => 
      link.patientId === input.patientId && 
      link.role === 'responsible' && 
      link.status === 'active'
    );
    
    if (existingResponsible) {
      throw new Error('Já existe um responsável principal ativo para este paciente.');
    }
  }
  
  const newLink: PatientTherapistLink = {
    id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    patientId: input.patientId,
    therapistId: input.therapistId,
    role: input.role,
    startDate: input.startDate,
    endDate: input.endDate,
    status: 'active',
    notes: input.notes,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  // Adiciona aos mocks (simulação)
  mockLinks.push(newLink);
  
  return newLink;
}

/**
 * Atualiza vínculo existente
 */
export async function updateLink(input: UpdateLinkInput): Promise<PatientTherapistLink> {
  await delay(600);
  
  const linkIndex = mockLinks.findIndex((link: PatientTherapistLink) => link.id === input.id);
  if (linkIndex === -1) {
    throw new Error('Vínculo não encontrado');
  }
  
  const existingLink = mockLinks[linkIndex];
  
  // Se está mudando para responsável, verifica regra
  if (input.role === 'responsible' && existingLink.role !== 'responsible') {
    const existingResponsible = mockLinks.find((link: PatientTherapistLink) => 
      link.patientId === existingLink.patientId && 
      link.role === 'responsible' && 
      link.status === 'active' &&
      link.id !== input.id
    );
    
    if (existingResponsible) {
      throw new Error('Já existe um responsável principal ativo para este paciente.');
    }
  }
  
  const updatedLink: PatientTherapistLink = {
    ...existingLink,
    ...input,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  mockLinks[linkIndex] = updatedLink;
  
  return updatedLink;
}

/**
 * Transfere responsabilidade
 * O antigo responsável vira co-terapeuta
 */
export async function transferResponsible(input: TransferResponsibleInput): Promise<void> {
  await delay(800);
  
  // Encontra o vínculo do responsável atual
  const currentResponsibleIndex = mockLinks.findIndex((link: PatientTherapistLink) => 
    link.patientId === input.patientId && 
    link.therapistId === input.fromTherapistId &&
    link.role === 'responsible' && 
    link.status === 'active'
  );
  
  if (currentResponsibleIndex === -1) {
    throw new Error('Responsável atual não encontrado');
  }
  
  // Verifica se o novo terapeuta já tem vínculo ativo com o paciente
  const existingNewTherapistLink = mockLinks.find((link: PatientTherapistLink) =>
    link.patientId === input.patientId &&
    link.therapistId === input.toTherapistId &&
    link.status === 'active'
  );
  
  if (existingNewTherapistLink) {
    // Se já é co-terapeuta, atualiza para responsável
    if (existingNewTherapistLink.role === 'co') {
      existingNewTherapistLink.role = 'responsible';
      existingNewTherapistLink.updatedAt = input.effectiveDate;
    }
  } else {
    // Cria novo vínculo como responsável
    const newResponsibleLink: PatientTherapistLink = {
      id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: input.patientId,
      therapistId: input.toTherapistId,
      role: 'responsible',
      startDate: input.effectiveDate,
      endDate: null,
      status: 'active',
      notes: `Transferido de ${input.fromTherapistId} em ${input.effectiveDate}`,
      createdAt: input.effectiveDate,
      updatedAt: input.effectiveDate
    };
    
    mockLinks.push(newResponsibleLink);
  }
  
  // Transforma o antigo responsável em co-terapeuta
  const oldLink = mockLinks[currentResponsibleIndex];
  mockLinks[currentResponsibleIndex] = {
    ...oldLink,
    role: 'co',
    updatedAt: input.effectiveDate
  };
}

/**
 * Encerra vínculo (seta endDate e status='ended')
 */
export async function endLink(id: string, endDate: string): Promise<void> {
  await delay(500);
  
  const linkIndex = mockLinks.findIndex((link: PatientTherapistLink) => link.id === id);
  if (linkIndex === -1) {
    throw new Error('Vínculo não encontrado');
  }
  
  mockLinks[linkIndex] = {
    ...mockLinks[linkIndex],
    endDate,
    status: 'ended',
    updatedAt: endDate
  };
}

/**
 * Arquiva vínculo (status='archived')
 */
export async function archiveLink(id: string): Promise<void> {
  await delay(400);
  
  const linkIndex = mockLinks.findIndex((link: PatientTherapistLink) => link.id === id);
  if (linkIndex === -1) {
    throw new Error('Vínculo não encontrado');
  }
  
  mockLinks[linkIndex] = {
    ...mockLinks[linkIndex],
    status: 'archived',
    updatedAt: new Date().toISOString().split('T')[0]
  };
}

/**
 * Busca todos os pacientes (para formulários)
 */
export async function getAllPatients(): Promise<Paciente[]> {
  try {
    const res = await fetch('/api/links/getAllClients', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    console.log(json);
    return [...json];
    throw new Error("Erro proposital para testar o catch");
  } catch {
    await delay(200);
    console.log(mockPatients);
    return [...mockPatients];
  }
}

/**
 * Busca todos os terapeutas (para formulários)
 */
export async function getAllTherapists(): Promise<Terapeuta[]> {
  await delay(200);
  return [...mockTherapists];
}

/**
 * Busca todos os vínculos (para listagens)
 */
export async function getAllLinks(): Promise<PatientTherapistLink[]> {
  await delay(300);
  return [...mockLinks];
}