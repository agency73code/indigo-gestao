import type {
  Paciente,
  Terapeuta,
  PatientTherapistLink,
  CreateLinkInput,
  UpdateLinkInput,
  TransferResponsibleInput,
  TherapistSupervisionLink,
  CreateSupervisionLinkInput,
  UpdateSupervisionLinkInput,
  SupervisionHierarchy,
  LinkFilters
} from '../types';
import {
  mockTherapists,
  mockSupervisionLinks,
} from '../mocks/links.mock';

export async function searchTherapists(role: 'supervisor' | 'clinico' | 'all', search: string): Promise<Terapeuta[]> {
  try {
    const query = new URLSearchParams();
    if (role && role !== 'all') query.set('role', role);
    if (search.trim()) query.set('search', search.trim());

    const res = await fetch(`/api/links/getAllTherapists?${query.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Falha ao buscar terapeutas.');
    
    return await res.json();
  } catch (err) {
    console.error('Erro ao buscar terapeutas:', err);
    return [];
  }
}

export async function searchPatients(search: string): Promise<Paciente[]> {
  try {
    const query = new URLSearchParams();
    if (search.trim()) query.set('search', search.trim());

    const res = await fetch(`/api/links/getAllClients?${query.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error('Falha ao buscar clientes.');
    }

    const clients = (await res.json()) as Paciente[];

    return clients;
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    return [];
  }
}

/**
 * Cria novo vínculo
 * Regras: Apenas 1 responsible ativo por paciente
 */
export async function createLink(input: CreateLinkInput): Promise<PatientTherapistLink> {
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
  return createdLink;
}

/**
 * Atualiza vínculo existente
 */
export async function updateLink(input: UpdateLinkInput): Promise<PatientTherapistLink> {
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
    return updatedLink;
  } catch (error) {
    console.error('Erro ao atualizar vínculo:', error);
    throw error;
  }
}

/**
 * Transfere responsabilidade
 * O antigo responsável vira co-terapeuta
 */
export async function transferResponsible(input: TransferResponsibleInput): Promise<void> {
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

    await res.json();
    return;
  } catch (error) {
    console.error('Erro ao transferir responsabilidade:', error);
    throw error;
  }
}

/**
 * Encerra vínculo (seta endDate e status='ended')
 */
export async function endLink(id: string, endDate: string): Promise<void> {
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

    await res.json();
    return;
  } catch (error) {
    console.error('Erro ao encerrar vínculo:', error);
    throw error;
  }
}

/**
 * Arquiva vínculo (status='archived')
 */
export async function archiveLink(id: string): Promise<void> {
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
      let error: { code?: string, message?: string } = {};

      try {
        error = await res.json(); // tenta ler o JSON que o AppError enviou
      } catch {
        // fallback se o corpo não for JSON
        const text = await res.text();
        error.message = text || 'Erro desconhecido ao arquivar vínculo.';
      }

      throw new Error(error.message || 'Falha ao arquivar vínculo.');
    }

    await res.json();
    return;
  } catch (error) {
    console.error('Erro ao arquivar vínculo:', error);
    throw error;
  }
}

/**
 * Reativa vínculo encerrado (remove endDate e volta status para 'active')
 */
export async function reactivateLink(id: string, actuationArea?: string | null): Promise<void> {
  try {
    const res = await fetch('/api/links/updateLink', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        id, 
        endDate: null,
        status: 'active',
        actuationArea: actuationArea || undefined
      })
    });

    if (!res.ok) {
      let errorMessage = 'Falha ao reativar vínculo';
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

    await res.json();
  } catch (error) {
    console.error('Erro ao reativar vínculo:', error);
    throw error;
  }
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

    if (!res.ok) {
      throw new Error('Falha ao carregar clientes');
    }

    const clients = (await res.json()) as Paciente[];

    return clients;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
}

/**
 * Busca todos os terapeutas (para formulários)
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

    return therapists;
  } catch (error) {
    console.error('Erro ao buscar terapeutas:', error);
    return [];
  }
}

/**
 * Busca todos os vínculos (para listagens)
 */
export async function getAllLinks(filters?: LinkFilters): Promise<PatientTherapistLink[]> {
  if (!filters || filters.viewBy === 'supervision') return [];

  // Monta query string a partir do objeto de filtros
  const query = filters
   ? '?' + new URLSearchParams(filters as Record<string, string>).toString()
   : '';

  const res = await fetch(`/api/links/getAllLinks${query}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Falha ao carregar vínculos');
  }
  
  const json = await res.json();
  return json as PatientTherapistLink[];
}

// ==================== FUNÇÕES DE VÍNCULOS DE SUPERVISÃO ====================

/**
 * Busca todos os vínculos de supervisão [feito]
 */
export async function getAllSupervisionLinks(filters?: LinkFilters): Promise<TherapistSupervisionLink[]> {
  if (!filters || filters.viewBy !== 'supervision') return [];

  const res = await fetch('/api/links/getAllSupervisionLinks', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(filters ?? {}),
  });

  if (!res.ok) {
    throw new Error('Falha ao carregar vínculos de supervisão');
  }

  const json = await res.json();
  console.log({ 'terapeuta-terapeuta': json })
  return json as TherapistSupervisionLink[];
}

/**
 * Cria novo vínculo de supervisão [feito]
 */
export async function createSupervisionLink(input: CreateSupervisionLinkInput): Promise<TherapistSupervisionLink> {
  // Validações básicas (front)
  if (input.supervisorId === input.supervisedTherapistId) {
    throw new Error('Um terapeuta não pode supervisionar a si mesmo.');
  }

  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    throw new Error('A data de término não pode ser anterior à data de início.');
  }

  const res = await fetch('/api/links/createSupervisionLink', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...input,
      hierarchyLevel: input.hierarchyLevel || 1,
      supervisionScope: input.supervisionScope || 'direct',
    })
  });

  if (!res.ok) {
    let errorMessage = 'Falha ao criar vínculo de supervisão.';
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

  return (await res.json()) as TherapistSupervisionLink;
}

/**
 * Atualiza vínculo de supervisão existente [feito]
 */
export async function updateSupervisionLink(input: UpdateSupervisionLinkInput): Promise<TherapistSupervisionLink> {
  const res = await fetch('/api/links/updateSupervisionLink', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  if (!res.ok) {
    let errorMessage = 'Falha ao atualizar vínculo de supervisão';
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

  const updatedLink = (await res.json()) as TherapistSupervisionLink;
  return updatedLink;
}

/**
 * Encerra vínculo de supervisão (seta endDate e status='ended') [feito]
 */
export async function endSupervisionLink(id: string, endDate: string): Promise<void> {
  const res = await fetch('/api/links/endSupervisionLink', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, endDate })
  });

  if (!res.ok) {
    let errorMessage = 'Falha ao encerrar vínculo de supervisão';
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

  await res.json();
}

/**
 * Arquiva vínculo de supervisão (status='archived') [feito]
 */
export async function archiveSupervisionLink(id: string): Promise<void> {
  const res = await fetch('/api/links/archiveSupervisionLink', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  });

  if (!res.ok) {
    let errorMessage = 'Falha ao arquivar vínculo de supervisão';
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

  await res.json();
}

/**
 * Reativa vínculo de supervisão encerrado (remove endDate e volta status para 'active')
 */
export async function reactivateSupervisionLink(id: string): Promise<void> {
  const res = await fetch('/api/links/updateSupervisionLink', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      id, 
      endDate: null,
      status: 'active'
    })
  });

  if (!res.ok) {
    let errorMessage = 'Falha ao reativar vínculo de supervisão';
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

  await res.json();
}

/**
 * Busca hierarquia completa de supervisão (incluindo subordinados indiretos)
 */
export async function getSupervisionHierarchy(
  supervisorId: string
): Promise<SupervisionHierarchy | null> {
  try {
    const response = await fetch(
      `/api/links/getSupervisionHierarchy?supervisorId=${supervisorId}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar hierarquia de supervisão');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      console.warn('⚠️ Backend não disponível, usando mock de hierarquia');
      
      // Mock: retornar hierarquia mockada
      const allLinks = mockSupervisionLinks.filter(
        link => link.supervisorId === supervisorId && link.status === 'active'
      );
      
      const supervisor = mockTherapists.find(t => t.id === supervisorId);
      if (!supervisor) return null;
      
      return {
        supervisorId,
        supervisor,
        directSubordinates: allLinks.filter(l => (l.hierarchyLevel || 1) === 1),
        indirectSubordinates: allLinks.filter(l => (l.hierarchyLevel || 1) > 1),
        totalSubordinatesCount: allLinks.length,
        maxHierarchyLevel: Math.max(...allLinks.map(l => l.hierarchyLevel || 1)),
      };
    }
    throw error;
  }
}

/**
 * Verifica se um supervisor pode visualizar dados de um terapeuta
 * (útil para controle de permissões no frontend)
 */
export async function canSuperviseTherapist(
  supervisorId: string,
  therapistId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/links/canSupervise?supervisorId=${supervisorId}&therapistId=${therapistId}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) return false;

    const result = await response.json();
    return result.canSupervise === true;
  } catch (error) {
    console.warn('⚠️ Erro ao verificar permissão de supervisão:', error);
    return false;
  }
}