import type {
  CreateHourEntryInput,
  HourEntryDTO,
  ListHourEntriesQuery,
  PagedResult,
  UpdateHourEntryInput,
} from '../types/hourEntry.types';

const ME = 'me-therapist';

let seq = 100;

const now = new Date();
const iso = (d: Date) => d.toISOString();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const DATASET: HourEntryDTO[] = [
  // Outubro 2025
  {
    id: 'm-001',
    therapistId: ME,
    patientId: 'p-raul',
    patientName: 'Raul Lima',
    date: toYMD(offsetDays(today, -2)),
    startTime: '14:00',
    durationMinutes: 60,
    hasTravel: false,
    notes: 'Paciente apresentou boa evolução nas atividades de linguagem. Realizamos exercícios de pronúncia e vocabulário contextualizado.',
    status: 'submitted',
    createdAt: iso(offsetMinutes(today, -120)),
    updatedAt: iso(offsetMinutes(today, -120)),
  },
  {
    id: 'm-002',
    therapistId: ME,
    patientId: 'p-sheila',
    patientName: 'Sheila Shanahan',
    date: toYMD(offsetDays(today, -4)),
    startTime: '09:00',
    durationMinutes: 90,
    hasTravel: true,
    notes: 'Sessão com deslocamento até a residência do paciente. Trabalhamos estímulos sensoriais e coordenação motora.',
    status: 'submitted',
    createdAt: iso(offsetDays(today, -4)),
    updatedAt: iso(offsetDays(today, -4)),
  },
  {
    id: 'm-003',
    therapistId: ME,
    patientId: 'p-sheila',
    patientName: 'Sheila Shanahan',
    date: toYMD(offsetDays(today, -5)),
    startTime: '10:30',
    durationMinutes: 60,
    hasTravel: false,
    notes: 'Atividades de atenção compartilhada e interação social.',
    status: 'approved',
    createdAt: iso(offsetDays(today, -5)),
    updatedAt: iso(offsetDays(today, -5)),
  },
  {
    id: 'm-004',
    therapistId: ME,
    patientId: 'p-ana',
    patientName: 'Ana Souza',
    date: toYMD(offsetDays(today, -6)),
    startTime: '16:00',
    durationMinutes: 120,
    hasTravel: false,
    notes: 'Atividade motora com foco em equilíbrio e propriocepção. Paciente demonstrou maior confiança nos movimentos.',
    status: 'approved',
    createdAt: iso(offsetDays(today, -6)),
    updatedAt: iso(offsetDays(today, -5)),
  },
  {
    id: 'm-005',
    therapistId: ME,
    patientId: 'p-lucas',
    patientName: 'Lucas Prado',
    date: toYMD(offsetDays(today, -7)),
    startTime: '11:00',
    durationMinutes: 30,
    hasTravel: false,
    notes: 'Sessão de follow-up para avaliar progressos desde a última consulta.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -7)),
    updatedAt: iso(offsetDays(today, -6)),
  },
  {
    id: 'm-006',
    therapistId: ME,
    patientId: 'p-raul',
    patientName: 'Raul Lima',
    date: toYMD(offsetDays(today, -9)),
    startTime: '15:00',
    durationMinutes: 60,
    hasTravel: false,
    notes: 'Continuação dos exercícios de linguagem. Boa participação.',
    status: 'approved',
    createdAt: iso(offsetDays(today, -9)),
    updatedAt: iso(offsetDays(today, -8)),
  },
  {
    id: 'm-007',
    therapistId: ME,
    patientId: 'p-sheila',
    patientName: 'Sheila Shanahan',
    date: toYMD(offsetDays(today, -10)),
    startTime: '09:30',
    durationMinutes: 90,
    hasTravel: true,
    notes: 'Sessão domiciliar. Trabalhado comunicação alternativa e rotinas.',
    status: 'approved',
    createdAt: iso(offsetDays(today, -10)),
    updatedAt: iso(offsetDays(today, -9)),
  },
  {
    id: 'm-008',
    therapistId: ME,
    patientId: 'p-ana',
    patientName: 'Ana Souza',
    date: toYMD(offsetDays(today, -12)),
    startTime: '14:30',
    durationMinutes: 60,
    hasTravel: false,
    notes: 'Exercícios de coordenação fina. Progresso significativo.',
    status: 'rejected',
    createdAt: iso(offsetDays(today, -12)),
    updatedAt: iso(offsetDays(today, -11)),
  },
  {
    id: 'm-009',
    therapistId: ME,
    patientId: 'p-lucas',
    patientName: 'Lucas Prado',
    date: toYMD(offsetDays(today, -13)),
    startTime: '10:00',
    durationMinutes: 30,
    hasTravel: false,
    notes: 'Avaliação mensal. Paciente demonstrou avanços na autonomia.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -13)),
    updatedAt: iso(offsetDays(today, -12)),
  },
  {
    id: 'm-010',
    therapistId: ME,
    patientId: 'p-raul',
    patientName: 'Raul Lima',
    date: toYMD(offsetDays(today, -14)),
    startTime: '14:00',
    durationMinutes: 60,
    hasTravel: false,
    notes: 'Trabalho com vocabulário temático sobre animais.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -14)),
    updatedAt: iso(offsetDays(today, -13)),
  },
  // Setembro 2025
  {
    id: 'm-011',
    therapistId: ME,
    patientId: 'p-sheila',
    patientName: 'Sheila Shanahan',
    date: toYMD(offsetDays(today, -18)),
    startTime: '09:00',
    durationMinutes: 90,
    hasTravel: true,
    notes: 'Sessão em casa. Atividades de vida diária.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -18)),
    updatedAt: iso(offsetDays(today, -17)),
  },
  {
    id: 'm-012',
    therapistId: ME,
    patientId: 'p-ana',
    patientName: 'Ana Souza',
    date: toYMD(offsetDays(today, -20)),
    startTime: '16:00',
    durationMinutes: 120,
    hasTravel: false,
    notes: 'Sessão intensiva. Múltiplas atividades motoras e cognitivas.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -20)),
    updatedAt: iso(offsetDays(today, -19)),
  },
  {
    id: 'm-013',
    therapistId: ME,
    patientId: 'p-lucas',
    patientName: 'Lucas Prado',
    date: toYMD(offsetDays(today, -22)),
    startTime: '11:30',
    durationMinutes: 30,
    hasTravel: false,
    notes: 'Revisão de atividades e planejamento do próximo mês.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -22)),
    updatedAt: iso(offsetDays(today, -21)),
  },
  {
    id: 'm-014',
    therapistId: ME,
    patientId: 'p-raul',
    patientName: 'Raul Lima',
    date: toYMD(offsetDays(today, -25)),
    startTime: '15:30',
    durationMinutes: 60,
    hasTravel: false,
    notes: 'Atividades lúdicas para estimular comunicação verbal.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -25)),
    updatedAt: iso(offsetDays(today, -24)),
  },
  {
    id: 'm-015',
    therapistId: ME,
    patientId: 'p-sheila',
    patientName: 'Sheila Shanahan',
    date: toYMD(offsetDays(today, -27)),
    startTime: '08:30',
    durationMinutes: 90,
    hasTravel: true,
    notes: 'Atendimento domiciliar. Família participativa.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -27)),
    updatedAt: iso(offsetDays(today, -26)),
  },
  {
    id: 'm-016',
    therapistId: ME,
    patientId: 'p-ana',
    patientName: 'Ana Souza',
    date: toYMD(offsetDays(today, -29)),
    startTime: '14:00',
    durationMinutes: 60,
    hasTravel: false,
    notes: 'Psicomotricidade e integração sensorial.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -29)),
    updatedAt: iso(offsetDays(today, -28)),
  },
  {
    id: 'm-017',
    therapistId: ME,
    patientId: 'p-lucas',
    patientName: 'Lucas Prado',
    date: toYMD(offsetDays(today, -32)),
    startTime: '10:30',
    durationMinutes: 30,
    hasTravel: false,
    notes: 'Sessão breve focada em habilidades sociais.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -32)),
    updatedAt: iso(offsetDays(today, -31)),
  },
  {
    id: 'm-018',
    therapistId: ME,
    patientId: 'p-raul',
    patientName: 'Raul Lima',
    date: toYMD(offsetDays(today, -34)),
    startTime: '14:30',
    durationMinutes: 60,
    hasTravel: false,
    notes: 'Exercícios de articulação e fluência.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -34)),
    updatedAt: iso(offsetDays(today, -33)),
  },
  // Agosto 2025
  {
    id: 'm-019',
    therapistId: ME,
    patientId: 'p-sheila',
    patientName: 'Sheila Shanahan',
    date: toYMD(offsetDays(today, -40)),
    startTime: '09:00',
    durationMinutes: 90,
    hasTravel: true,
    notes: 'Sessão completa com múltiplos estímulos sensoriais.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -40)),
    updatedAt: iso(offsetDays(today, -39)),
  },
  {
    id: 'm-020',
    therapistId: ME,
    patientId: 'p-ana',
    patientName: 'Ana Souza',
    date: toYMD(offsetDays(today, -45)),
    startTime: '15:00',
    durationMinutes: 120,
    hasTravel: false,
    notes: 'Atividades de coordenação global e equilíbrio dinâmico.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -45)),
    updatedAt: iso(offsetDays(today, -44)),
  },
  {
    id: 'm-021',
    therapistId: ME,
    patientId: 'p-lucas',
    patientName: 'Lucas Prado',
    date: toYMD(offsetDays(today, -50)),
    startTime: '11:00',
    durationMinutes: 30,
    hasTravel: false,
    notes: 'Acompanhamento regular e orientação aos responsáveis.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -50)),
    updatedAt: iso(offsetDays(today, -49)),
  },
  {
    id: 'm-022',
    therapistId: ME,
    patientId: 'p-raul',
    patientName: 'Raul Lima',
    date: toYMD(offsetDays(today, -55)),
    startTime: '14:00',
    durationMinutes: 60,
    hasTravel: false,
    notes: 'Trabalho intensivo em compreensão auditiva.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -55)),
    updatedAt: iso(offsetDays(today, -54)),
  },
  {
    id: 'm-023',
    therapistId: ME,
    patientId: 'p-sheila',
    patientName: 'Sheila Shanahan',
    date: toYMD(offsetDays(today, -60)),
    startTime: '10:00',
    durationMinutes: 90,
    hasTravel: true,
    notes: 'Atendimento em domicílio com participação da família.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -60)),
    updatedAt: iso(offsetDays(today, -59)),
  },
  {
    id: 'm-024',
    therapistId: ME,
    patientId: 'p-ana',
    patientName: 'Ana Souza',
    date: toYMD(offsetDays(today, -65)),
    startTime: '16:30',
    durationMinutes: 60,
    hasTravel: false,
    notes: 'Atividades de propriocepção e consciência corporal.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -65)),
    updatedAt: iso(offsetDays(today, -64)),
  },
  {
    id: 'm-025',
    therapistId: ME,
    patientId: 'p-lucas',
    patientName: 'Lucas Prado',
    date: toYMD(offsetDays(today, -70)),
    startTime: '10:30',
    durationMinutes: 30,
    hasTravel: false,
    notes: 'Sessão de revisão e avaliação de progresso trimestral.',
    status: 'paid',
    createdAt: iso(offsetDays(today, -70)),
    updatedAt: iso(offsetDays(today, -69)),
  },
];

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function offsetDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(base.getDate() + days);
  return d;
}

function offsetMinutes(base: Date, minutes: number) {
  const d = new Date(base);
  d.setMinutes(base.getMinutes() + minutes);
  return d;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function listMine(
  query: ListHourEntriesQuery = {}
): Promise<PagedResult<HourEntryDTO>> {
  console.log('📋 [MOCK] listMine chamado com query:', query);
  await delay(250);
  const page = query.page && query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 10;

  let rows = DATASET.filter((r) => r.therapistId === ME);

  if (query.from) rows = rows.filter((r) => r.date >= query.from!);
  if (query.to) rows = rows.filter((r) => r.date <= query.to!);
  
  // Filtro por paciente: usa patientName se fornecido (para compatibilidade com IDs reais da API)
  if (query.patientId) {
    if (query.patientName) {
      // Se temos o nome, filtra por nome (case-insensitive)
      const searchName = query.patientName.toLowerCase();
      rows = rows.filter((r) => r.patientName?.toLowerCase() === searchName);
    } else {
      // Fallback: tenta filtrar por ID
      rows = rows.filter((r) => r.patientId === query.patientId);
    }
  }
  
  if (query.status) rows = rows.filter((r) => r.status === query.status);

  // Ordenação: date desc, createdAt desc
  rows.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const items = rows.slice(start, start + pageSize);
  return { items, total, page, pageSize };
}

export async function create(input: CreateHourEntryInput): Promise<HourEntryDTO> {
  console.log('✨ [MOCK] create chamado com input:', input);
  await delay(250);
  const nowIso = new Date().toISOString();
  const id = `mock-${++seq}`;
  const row: HourEntryDTO = {
    id,
    therapistId: ME,
    patientId: input.patientId,
    patientName: resolvePatientName(input.patientId),
    date: input.date,
    startTime: input.startTime,
    durationMinutes: input.durationMinutes,
    hasTravel: input.hasTravel,
    notes: (input.notes || '').slice(0, 500),
    status: 'submitted', // Sempre cria como "enviado" (terapeuta não pode criar rascunho)
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  DATASET.unshift(row);
  return row;
}

export async function submit(id: string): Promise<void> {
  console.log('📤 [MOCK] submit chamado com id:', id);
  await delay(200);
  const row = DATASET.find((r) => r.id === id && r.therapistId === ME);
  if (row) {
    row.status = 'submitted';
    row.updatedAt = new Date().toISOString();
  }
}

export async function update(
  id: string,
  input: UpdateHourEntryInput
): Promise<HourEntryDTO> {
  await delay(250);
  const row = DATASET.find((r) => r.id === id && r.therapistId === ME);
  if (!row) throw new Error('Not found');

  // campos editáveis pelo terapeuta
  if (typeof input.startTime !== 'undefined') row.startTime = input.startTime;
  if (typeof input.durationMinutes !== 'undefined')
    row.durationMinutes = input.durationMinutes;
  if (typeof input.hasTravel !== 'undefined') row.hasTravel = input.hasTravel;
  if (typeof input.notes !== 'undefined') row.notes = (input.notes || '').slice(0, 500);
  row.updatedAt = new Date().toISOString();
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function remove(_id: string): Promise<void> {
  await delay(200);
  // Terapeuta não pode excluir lançamentos (função mantida apenas para compatibilidade)
  throw new Error('Terapeuta não pode excluir lançamentos.');
}

export async function getById(id: string): Promise<HourEntryDTO> {
  await delay(150);
  const row = DATASET.find((r) => r.id === id && r.therapistId === ME);
  if (!row) throw new Error('Not found');
  return row;
}

function resolvePatientName(patientId: string): string {
  const map: Record<string, string> = {
    'p-raul': 'Raul Lima',
    'p-sheila': 'Sheila Shanahan',
    'p-ana': 'Ana Souza',
    'p-lucas': 'Lucas Prado',
  };
  return map[patientId] || 'Paciente';
}
