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
 * Cria novo vínculo [feito]
 * Regras: Apenas 1 responsible ativo por paciente
 */
export async function createLink(input: CreateLinkInput): Promise<PatientTherapistLink> {
  await delay(800);

  try {
    const res = await fetch('/api/links/createLink', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!res.ok) {
      let errorMessage = 'Falha ao criar vínculo';
      const errorText = await res.text();

      if (errorText) {
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.message) {
            errorMessage = parsed.message;
          }
        } catch {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    const createdLink = (await res.json()) as PatientTherapistLink;
    mockLinks.push(createdLink);
    return createdLink;
  } catch (error) {
    if (error instanceof Error && error.name !== 'TypeError') {
      throw error;
    }

    console.error('Erro ao criar vínculo no backend, utilizando fallback local:', error);
  }

  if (input.role === 'responsible') {
    const existingResponsible = mockLinks.find((link: PatientTherapistLink) =>
      link.patientId === input.patientId &&
      link.role === 'responsible' &&
      link.status === 'active'
    );
    
    if (existingResponsible) {
      throw new Error('Já existe um responsável principal ativo para este cliente.');
    }
  }
  
  const normalizedActuationArea = input.actuationArea?.trim();

  if (!normalizedActuationArea) {
    throw new Error('Selecione a área de atuação do terapeuta.');
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
    actuationArea: normalizedActuationArea,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  // Adiciona aos mocks (simulação)
  mockLinks.push(newLink);
  
  return newLink;
}

/**
 * Atualiza vínculo existente [feito]
 */
export async function updateLink(input: UpdateLinkInput): Promise<PatientTherapistLink> {
  await delay(600);

  try {
    const res = await fetch('/api/links/updateLink', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!res.ok) {
      let errorMessage = 'Falha ao atualizar vínculo';
      const errorText = await res.text();

      if (errorText) {
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.message) {
            errorMessage = parsed.message;
          }
        } catch {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    const updatedLink = (await res.json()) as PatientTherapistLink;
    const backendLinkIndex = mockLinks.findIndex((link: PatientTherapistLink) => link.id === updatedLink.id);

    if (backendLinkIndex === -1) {
      mockLinks.push(updatedLink);
    } else {
      mockLinks[backendLinkIndex] = updatedLink;
    }

    return updatedLink;
  } catch (error) {
    if (error instanceof Error && error.name !== 'TypeError') {
      throw error
    }

    console.error('Erro ao atualizar vínculo no backend, utilizando fallback local:', error);
  }
  
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
      throw new Error('Já existe um responsável principal ativo para este cliente.');
    }
  }

  const normalizedStartDate = input.startDate ?? existingLink.startDate;
  const parsedStartDate = new Date(normalizedStartDate);

  if (Number.isNaN(parsedStartDate.getTime())) {
    throw new Error('Data de início inválida.');
  }

  const hasEndDate = Object.prototype.hasOwnProperty.call(input, 'endDate');

  let normalizedEndDate: string | null;
  if (hasEndDate) {
    if (input.endDate === null) {
      normalizedEndDate = null;
    } else if (typeof input.endDate === 'string' && input.endDate.trim() !== '') {
      const parsedEndDate = new Date(input.endDate);

      if (Number.isNaN(parsedEndDate.getTime())) {
        throw new Error('Data de término inválida.');
      }

      if (parsedEndDate < parsedStartDate) {
        throw new Error('A data de encerramento não pode ser anterior à data de início.');
      }

      normalizedEndDate = parsedEndDate.toISOString().split('T')[0];
    } else if (typeof input.endDate === 'string') {
      normalizedEndDate = null;
    } else {
      normalizedEndDate = existingLink.endDate ?? null;
    }
  } else {
    normalizedEndDate = existingLink.endDate ?? null;
    if (normalizedEndDate) {
      const parsedEndDate = new Date(normalizedEndDate);
      if (parsedEndDate < parsedStartDate) {
        throw new Error('A data de encerramento não pode ser anterior à data de início.');
      }
    }
  }

  const normalizedStartDateString = parsedStartDate.toISOString().split('T')[0];

  const normalizedActuationArea =
    typeof input.actuationArea === 'string'
      ? input.actuationArea.trim()
      : (existingLink.actuationArea ?? '').trim();

  if (!normalizedActuationArea) {
    throw new Error('Selecione a área de atuação do terapeuta.');
  }
  
  const updatedLink: PatientTherapistLink = {
    ...existingLink,
    ...input,
    startDate: normalizedStartDateString,
    endDate: normalizedEndDate,
    actuationArea: normalizedActuationArea,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  mockLinks[linkIndex] = updatedLink;
  
  return updatedLink;
}

/**
 * Transfere responsabilidade [feito]
 * O antigo responsável vira co-terapeuta
 */
export async function transferResponsible(input: TransferResponsibleInput): Promise<void> {
  await delay(800);
  
  try {
    const res = await fetch('/api/links/transferResponsible', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!res.ok) {
      let errorMessage = 'Falha ao transferir responsabilidade';
      const errorText = await res.text();

      if (errorText) {
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.message) {
            errorMessage = parsed.message;
          }
        } catch {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    const { newResponsible, previousResponsible } = (await res.json()) as {
      newResponsible: PatientTherapistLink;
      previousResponsible: PatientTherapistLink;
    };

    const previousIndex = mockLinks.findIndex((link: PatientTherapistLink) => link.id === previousResponsible.id);
    if (previousIndex === -1) {
      mockLinks.push(previousResponsible);
    } else {
      mockLinks[previousIndex] = previousResponsible;
    }

    const newIndex = mockLinks.findIndex((link: PatientTherapistLink) => link.id === newResponsible.id);
    if (newIndex === -1) {
      mockLinks.push(newResponsible);
    } else {
      mockLinks[newIndex] = newResponsible;
    }

    return;
  } catch (error) {
    if (error instanceof Error && error.name !== 'TypeError') {
      throw error;
    }

    console.error('Erro ao transferir responsabilidade no backend, utilizando fallback local:', error);
  }

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
  
  const normalizedOldActuation = input.oldResponsibleActuation.trim();
  const normalizedNewActuation = input.newResponsibleActuation.trim();

  if (!normalizedNewActuation) {
    throw new Error('Selecione a atuação para o novo responsável.');
  }

  if (!normalizedOldActuation) {
    throw new Error('Selecione a atuação para o antigo responsável.');
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
      existingNewTherapistLink.status = 'active';
      existingNewTherapistLink.endDate = null;
      existingNewTherapistLink.actuationArea = normalizedNewActuation;
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
      actuationArea: normalizedNewActuation,
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
    actuationArea: normalizedOldActuation,
    updatedAt: input.effectiveDate
  };
}

/**
 * Encerra vínculo (seta endDate e status='ended') [feito]
 */
export async function endLink(id: string, endDate: string): Promise<void> {
  await delay(500);

  try {
    const res = await fetch('/api/links/endLink', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, endDate })
    });

    if (!res.ok) {
      let errorMessage = 'Falha ao encerrar vínculo';
      const errorText = await res.text();

      if (errorText) {
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.message) {
            errorMessage = parsed.message;
          }
        } catch {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    const endedLink = (await res.json()) as PatientTherapistLink;
    const linkIndex = mockLinks.findIndex((link: PatientTherapistLink) => link.id === endedLink.id);

    if (linkIndex === -1) {
      mockLinks.push(endedLink);
    } else {
      mockLinks[linkIndex] = endedLink;
    }

    return;
  } catch (error) {
    if (error instanceof Error && error.name !== 'TypeError') {
      throw error;
    }

    console.error('Erro ao encerrar vínculo no backend, utilizando fallback local:', error);
  }
  
  const linkIndex = mockLinks.findIndex((link: PatientTherapistLink) => link.id === id);
  if (linkIndex === -1) {
    throw new Error('Vínculo não encontrado');
  }

  const existingLink = mockLinks[linkIndex];
  const parsedEndDate = new Date(endDate);

  if (Number.isNaN(parsedEndDate.getTime())) {
    throw new Error('Data de encerramento inválida.');
  }

  const parsedStartDate = new Date(existingLink.startDate);
  if (!Number.isNaN(parsedStartDate.getTime()) && parsedEndDate < parsedStartDate) {
    throw new Error('A data de encerramento não pode ser anterior à data de início.');
  }

  const normalizedEndDate = parsedEndDate.toISOString().split('T')[0];
  
  mockLinks[linkIndex] = {
    ...existingLink,
    endDate: normalizedEndDate,
    status: 'ended',
    updatedAt: normalizedEndDate
  };
}

/**
 * Arquiva vínculo (status='archived') [feito]
 */
export async function archiveLink(id: string): Promise<void> {
  await delay(400);
  
  try {
    const res = await fetch('/api/links/archiveLink', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    });

    if (!res.ok) {
      let errorMessage = 'Falha ao arquivar vínculo';
      const errorText = await res.text();

      if (errorText) {
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.message) {
            errorMessage = parsed.message;
          }
        } catch {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    const archiveLink = (await res.json()) as PatientTherapistLink;

    const linkIndex = mockLinks.findIndex((link: PatientTherapistLink) => link.id === archiveLink.id);
    if (linkIndex === -1) {
      mockLinks.push(archiveLink);
    } else {
      mockLinks[linkIndex] = archiveLink;
    }

    return
  } catch (error) {
    if (error instanceof Error && error.name !== 'TypeError') {
      throw error;
    }

    console.error('Erro ao arquivar vínculo no backend, utilizando fallback local:', error);
  }

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
 * Busca todos os pacientes (para formulários) [feito]
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

    if (!res.ok) {
      throw new Error('Falha ao carregar clientes');
    }

    const clients = (await res.json()) as Paciente[];

    const clientsWithAvatar = await Promise.all(
      clients.map(async (p) => {
        try {
          const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?id=${p.id}&type=client`, {
            credentials: 'include',
          });
          const data = await avatarRes.json();
          return { ...p, avatarUrl: data.avatarUrl ?? '' };
        } catch {
          return { ...p,avatarUrl: '' };
        }
      })
    );
    return clientsWithAvatar;
  } catch (error) {
    console.error('Erro ao buscar clientes, retornando mock:', error);
    await delay(200);
    return [...mockPatients];
  }
}

/**
 * Busca todos os terapeutas (para formulários) [feito]
 */
export async function getAllTherapists(): Promise<Terapeuta[]> {
  try {
    const res = await fetch('/api/links/getAllTherapists', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Falha ao carregar terapeutas');
    }
    
    const therapists = (await res.json()) as Terapeuta[];

    const therapistsWithAvatar = await Promise.all(
      therapists.map(async (t) => {
        try {
          const avatarRes = await fetch(`${import.meta.env.VITE_API_URL}/arquivos/getAvatar?id=${t.id}&type=therapist`, {
            credentials: 'include',
          });
          const data = await avatarRes.json();
          return { ...t, avatarUrl: data.avatarUrl ?? '' };
        } catch {
          return { ...t,avatarUrl: '' };
        }
      })
    );
    return therapistsWithAvatar;
  } catch (error) {
    console.error('Erro ao buscar terapeutas, retornando mock:', error);
    await delay(200);
    return [...mockTherapists];
  }
}

/**
 * Busca todos os vínculos (para listagens) [feito]
 */
export async function getAllLinks(): Promise<PatientTherapistLink[]> {
  try {
    const res = await fetch('/api/links/getAllLinks', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!res.ok) {
      throw new Error('Falha ao carregar vínculos');
    }

    const json = await res.json();
    return json as PatientTherapistLink[];
  } catch (error) {
    console.error('Erro ao buscar vínculos, retornando mock:', error);
    await delay(300);
    return [...mockLinks];
  }
}