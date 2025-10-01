// IMPORTS: pegue do types central do projeto (não duplique)
import type { Paciente, Terapeuta, CadastroFormProps } from '../types/cadastros.types';

// Derivar IDs seguros a partir dos types fornecidos
export type PatientId = NonNullable<Paciente['id']>;
export type TherapistId = NonNullable<Terapeuta['id']>;

// Domínio do vínculo
export type LinkId = string;
export type LinkRole = string;
export type LinkStatus = 'active' | 'ended' | 'archived';

// ISO date string (reusar se já existir algo similar; senão, declare local)
export type IsoDate = string; // 'YYYY-MM-DD'

export interface PatientTherapistLink {
  id: LinkId;
  patientId: PatientId;
  therapistId: TherapistId;
  role: LinkRole;                   // responsible | co
  startDate: IsoDate;               // obrigatória
  endDate?: IsoDate | null;         // >= startDate, opcional
  status: LinkStatus;               // active | ended | archived
  notes?: string | null;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface CreateLinkInput {
  patientId: PatientId;
  therapistId: TherapistId;
  role: LinkRole;
  startDate: IsoDate;
  endDate?: IsoDate | null;
  notes?: string | null;
}

export interface UpdateLinkInput {
  id: LinkId;
  role?: LinkRole;
  startDate?: IsoDate;
  endDate?: IsoDate | null;
  notes?: string | null;
  status?: LinkStatus;
}

export interface TransferResponsibleInput {
  patientId: PatientId;
  fromTherapistId: TherapistId;
  toTherapistId: TherapistId;
  effectiveDate: IsoDate;
}

export interface LinkFilters {
  q?: string;                       // busca por nome (paciente/terapeuta)
  status?: LinkStatus | 'all';
  viewBy?: 'patient' | 'therapist'; // tab de visualização
  orderBy?: 'recent' | 'alpha';
  page?: number;
  pageSize?: number;
}

// Estruturas de agrupamento para consolidação
export interface PatientWithLinks {
  patient: Paciente;
  links: PatientTherapistLink[];
}

export interface TherapistWithLinks {
  therapist: Terapeuta;
  links: PatientTherapistLink[];
}

export interface LinkFiltersProps {
  filters: LinkFilters;
  onFiltersChange: (filters: LinkFilters) => void;
}

export interface LinkListProps {
  links: PatientTherapistLink[];
  patients: Paciente[];
  therapists: Terapeuta[];
  filters: LinkFilters;
  loading?: boolean;
  onEditLink: (link: PatientTherapistLink) => void;
  onAddTherapist: (patientId: string) => void;
  onTransferResponsible: (link: PatientTherapistLink) => void;
  onEndLink: (link: PatientTherapistLink) => void;
  onArchiveLink: (link: PatientTherapistLink) => void;
}

export interface LinkCardProps {
  // Para visualização consolidada (viewBy='patient')
  patientWithLinks?: PatientWithLinks;
  // Para visualização consolidada (viewBy='therapist') 
  therapistWithLinks?: TherapistWithLinks;
  // Modo de visualização
  viewBy: 'patient' | 'therapist';
  // Ações
  onEdit: (link: PatientTherapistLink) => void;
  onAddTherapist: (patientId: string) => void;
  onTransferResponsible: (link: PatientTherapistLink) => void;
  onEndLink: (link: PatientTherapistLink) => void;
  onArchive: (link: PatientTherapistLink) => void;
}

export interface LinkFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLinkInput | UpdateLinkInput) => void;
  initialData?: PatientTherapistLink | null;
  patients: Paciente[];
  therapists: Terapeuta[];
  loading?: boolean;
}

export interface TransferResponsibleDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: TransferResponsibleInput) => void;
  link: PatientTherapistLink | null;
  patient?: Paciente;
  therapist?: Terapeuta;
  therapists: Terapeuta[];
  loading?: boolean;
}

export interface EndLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (endDate: IsoDate) => void;
  link: PatientTherapistLink | null;
  loading?: boolean;
}

export interface ArchiveDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  link: PatientTherapistLink | null;
  loading?: boolean;
}

// Re-export necessários
export type { Paciente, Terapeuta, CadastroFormProps };