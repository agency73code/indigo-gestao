import type { RegistroTentativa } from '../types';

export type Counts = { erro: number; ajuda: number; indep: number };
export type StatusKind = 'insuficiente' | 'positivo' | 'mediano' | 'atencao';

export function sumCounts(a: Counts, b: Counts): Counts {
  return { 
    erro: a.erro + b.erro, 
    ajuda: a.ajuda + b.ajuda, 
    indep: a.indep + b.indep 
  };
}

export function total(c: Counts): number {
  return c.erro + c.ajuda + c.indep;
}

export function ti(c: Counts): number {
  const t = total(c);
  return t === 0 ? 0 : Math.round((c.indep / t) * 100);
}

export function toStatus(c: Counts): StatusKind {
  const t = total(c);
  if (t < 5) return 'insuficiente';
  const p = ti(c);
  if (p > 80) return 'positivo';
  if (p > 60) return 'mediano';
  return 'atencao';
}

export function aggregateByStimulus(registros: RegistroTentativa[]): Record<string, Counts> {
  const result: Record<string, Counts> = {};

  for (const reg of registros) {
    const key = reg.stimulusId || 'unknown';
    if (!result[key]) {
      result[key] = { erro: 0, ajuda: 0, indep: 0 };
    }
    
    if (reg.resultado === 'erro') {
      result[key].erro += 1;
    } else if (reg.resultado === 'ajuda') {
      result[key].ajuda += 1;
    } else if (reg.resultado === 'acerto') {
      result[key].indep += 1;
    }
  }
  
  return result;
}

export function getStatusConfig(kind: StatusKind) {
  const configs = {
    insuficiente: {
      label: 'Coleta insuficiente',
      cls: 'border-muted text-muted-foreground bg-muted/40',
    },
    positivo: {
      label: 'Positivo',
      cls: 'border-green-500/40 text-green-700 bg-green-50',
    },
    mediano: {
      label: 'Mediano',
      cls: 'border-amber-500/40 text-amber-700 bg-amber-50',
    },
    atencao: {
      label: 'Atenção',
      cls: 'border-orange-500/40 text-orange-700 bg-orange-50',
    },
  };
  return configs[kind];
}

export function sortBySeverity(statusA: StatusKind, statusB: StatusKind): number {
  const order: StatusKind[] = ['atencao', 'mediano', 'positivo', 'insuficiente'];
  return order.indexOf(statusA) - order.indexOf(statusB);
}
