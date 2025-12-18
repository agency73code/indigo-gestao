/**
 * Serviço de relatórios para Musicoterapia
 */

import type { Sessao } from '@/features/programas/consulta-sessao/types';
import { extractStimulusIds } from '../utils/extractStimulusIds';
import { emptyMusiDashboardResult } from '../types';

export async function fetchMusicReports(sessoes: Sessao[]) {
  if (!sessoes || sessoes.length === 0) {
    return emptyMusiDashboardResult;
  }

  const sessionIds = sessoes.map(s => Number(s.id));
  const stimulusIds = extractStimulusIds(sessoes)

  const response = await fetch('/api/ocp/musictherapy/sessions/calculateMusicKpis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionIds, stimulusIds }),
  });

  if (!response.ok) {
    console.error("Erro buscando relatórios:", await response.text());

    return emptyMusiDashboardResult;
  }

  return await response.json();
}