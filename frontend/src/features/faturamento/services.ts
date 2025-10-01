import type { BillingEntry } from "./types";

export async function getTherapistRate(therapistId: string): Promise<number | null> {
  // TODO: integrar ao cadastro do terapeuta (valorHoraAcordado)
  // Por enquanto, retornar mock/null (null => front pede override manual)
  console.log('Getting therapist rate for:', therapistId);
  return null;
}

export function computeTotal(params: { durationMinutes: number; hourlyRate: number; travelCost?: number }): number {
  const hours = Math.max(0, params.durationMinutes) / 60;
  const base = hours * Math.max(0, params.hourlyRate || 0);
  const travel = Math.max(0, params.travelCost || 0);
  return Math.round((base + travel) * 100) / 100;
}

export async function createBillingEntry(payload: BillingEntry): Promise<{ id: string }> {
  // TODO: integrar API de lançamentos
  // validar payload mínimo e simular retorno
  console.log('Creating billing entry:', payload);
  return { id: crypto.randomUUID() };
}