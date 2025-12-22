import type { Sessao } from '@/features/programas/consulta-sessao/types';
import { extractStimulusIds } from '../utils/extractStimulusIds';
import { emptyOccupationalDashboardResult } from '../types';

export async function fetchOccupationalReports(sessoes: Sessao[]) {
  if (!sessoes || sessoes.length === 0) {
    return emptyOccupationalDashboardResult;
  }

  const sessionIds = sessoes.map(s => Number(s.id));
  const stimulusIds = extractStimulusIds(sessoes)

  const response = await fetch('/api/ocp/to/sessions/calculateOccupationalKpis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionIds, stimulusIds }),
  });

  if (!response.ok) {
    console.error("Erro buscando relatórios:", await response.text());

    return emptyOccupationalDashboardResult;
  }

  return await response.json();
}
