export interface BillingEntry {
  id?: string;
  patientId: string;
  therapistId: string;
  date: string;              // ISO (yyyy-mm-dd)
  time?: string | null;      // HH:mm (opcional)
  durationMinutes: number;   // 30, 60, 90, 120, etc.
  hourlyRate: number;        // em reais
  travelCost?: number;       // em reais (optional)
  notes?: string | null;
  total: number;             // calculado no front antes do submit
}

// Reutilizar os types existentes do projeto
export type { Patient } from '../programas/consultar-programas/types';
export type { Therapist } from '../programas/cadastro-ocp/types';