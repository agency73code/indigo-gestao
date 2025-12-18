import type { Sessao } from '@/features/programas/consulta-sessao/types';

export function extractStimulusIds(sessoes: Sessao[]): number[] {
  const ids = sessoes
    .flatMap(s => s.registros.map(r => Number(r.stimulusId)))
    .filter(id => !isNaN(id));

  return Array.from(new Set(ids));
}