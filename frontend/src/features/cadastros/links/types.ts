// IMPORTS: pegue do types central do projeto (não duplique)
import type { Paciente, Terapeuta, CadastroFormProps } from '../types/cadastros.types';

// Derivar IDs seguros a partir dos types fornecidos
export type PatientId = NonNullable<Paciente['id']>;
export type TherapistId = NonNullable<Terapeuta['id']>;

// Domínio do vínculo
export type LinkId = string;
export type LinkRole = 'responsible' | 'co';
export type LinkStatus = 'active' | 'ended' | 'archived';

// Tipos para vínculos de supervisão
export type SupervisionLinkId = string;
export type SupervisionLinkStatus = 'active' | 'ended' | 'archived';
export type SupervisionScope = 'direct' | 'team';

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
  actuationArea?: string | null;    // Área de atuação do terapeuta no vínculo
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
  actuationArea?: string;   // Atuação específica para co-terapeuta
}

export interface UpdateLinkInput {
  id: LinkId;
  role?: LinkRole;
  startDate?: IsoDate;
  endDate?: IsoDate | null;
  notes?: string | null;
  status?: LinkStatus;
  actuationArea?: string;   // Atuação específica para co-terapeuta
}

export interface TransferResponsibleInput {
  patientId: PatientId;
  fromTherapistId: TherapistId;
  toTherapistId: TherapistId;
  effectiveDate: IsoDate;
  oldResponsibleActuation: string;  // Atuação do antigo responsável (agora co-terapeuta)
  newResponsibleActuation: string;
}

// Interfaces para vínculos de supervisão
export interface TherapistSupervisionLink {
  id: SupervisionLinkId;
  supervisorId: TherapistId;
  supervisedTherapistId: TherapistId;
  hierarchyLevel?: number;           // 1=direto, 2+=indireto (via outro supervisor)
  supervisionScope?: SupervisionScope; // 'direct' | 'team'
  startDate: IsoDate;
  endDate?: IsoDate | null;
  status: SupervisionLinkStatus;
  notes?: string | null;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface CreateSupervisionLinkInput {
  supervisorId: TherapistId;
  supervisedTherapistId: TherapistId;
  hierarchyLevel?: number;           // Nível hierárquico (padrão: 1)
  supervisionScope?: SupervisionScope; // Escopo da supervisão
  startDate: IsoDate;
  endDate?: IsoDate | null;
  notes?: string | null;
}

export interface UpdateSupervisionLinkInput {
  id: SupervisionLinkId;
  hierarchyLevel?: number;
  supervisionScope?: SupervisionScope;
  startDate?: IsoDate;
  endDate?: IsoDate | null;
  notes?: string | null;
  status?: SupervisionLinkStatus;
}

export interface LinkFilters {
  q?: string;                       // busca por nome (paciente/terapeuta)
  status?: LinkStatus | 'all';
  viewBy?: 'patient' | 'therapist' | 'supervision'; // tab de visualização
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

export interface SupervisorWithLinks {
  supervisor: Terapeuta;
  links: TherapistSupervisionLink[];
  hierarchyLevels?: SubordinatesByLevel[];  // Subordinados agrupados por nível
  totalSubordinates?: number;                // Total de subordinados (todos níveis)
  hasIndirectSupervision?: boolean;          // Se supervisiona indiretamente alguém
}

// Interface para representar hierarquia completa (retorno do backend)
export interface SupervisionHierarchy {
  supervisorId: TherapistId;
  supervisor: Terapeuta;
  directSubordinates: TherapistSupervisionLink[];      // Nível 1
  indirectSubordinates: TherapistSupervisionLink[];    // Nível 2+
  totalSubordinatesCount: number;
  maxHierarchyLevel: number;
}

// Informação de subordinados agrupados por nível
export interface SubordinatesByLevel {
  level: number;
  subordinates: Array<{
    therapist: Terapeuta;
    link: TherapistSupervisionLink;
  }>;
}

export interface LinkFiltersProps {
  filters: LinkFilters;
  onFiltersChange: (filters: LinkFilters) => void;
}

export interface LinkListProps {
  links: PatientTherapistLink[];
  supervisionLinks: TherapistSupervisionLink[];
  patients: Paciente[];
  therapists: Terapeuta[];
  filters: LinkFilters;
  loading?: boolean;
  onEditLink: (link: PatientTherapistLink) => void;
  onAddTherapist: (patientId: string) => void;
  onTransferResponsible: (link: PatientTherapistLink) => void;
  onEndLink: (link: PatientTherapistLink) => void;
  onArchiveLink: (link: PatientTherapistLink) => void;
  onEditSupervisionLink: (link: TherapistSupervisionLink) => void;
  onEndSupervisionLink: (link: TherapistSupervisionLink) => void;
  onArchiveSupervisionLink: (link: TherapistSupervisionLink) => void;
}

export interface LinkCardProps {
  // Para visualização consolidada (viewBy='patient')
  patientWithLinks?: PatientWithLinks;
  // Para visualização consolidada (viewBy='therapist') 
  therapistWithLinks?: TherapistWithLinks;
  // Para visualização consolidada (viewBy='supervision')
  supervisorWithLinks?: SupervisorWithLinks;
  // Modo de visualização
  viewBy: 'patient' | 'therapist' | 'supervision';
  // Listas para lookup de dados
  patients: Paciente[];
  therapists: Terapeuta[];
  // Ações
  onEdit: (link: PatientTherapistLink) => void;
  onAddTherapist: (patientId: string) => void;
  onTransferResponsible: (link: PatientTherapistLink) => void;
  onEndLink: (link: PatientTherapistLink) => void;
  onArchive: (link: PatientTherapistLink) => void;
  onEditSupervision: (link: TherapistSupervisionLink) => void;
  onEndSupervision: (link: TherapistSupervisionLink) => void;
  onArchiveSupervision: (link: TherapistSupervisionLink) => void;
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

export interface SupervisionLinkFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSupervisionLinkInput | UpdateSupervisionLinkInput) => void;
  initialData?: TherapistSupervisionLink | null;
  therapists: Terapeuta[];
  loading?: boolean;
}

export interface EndSupervisionLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (endDate: IsoDate) => void;
  link: TherapistSupervisionLink | null;
  loading?: boolean;
}

export interface ArchiveSupervisionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  link: TherapistSupervisionLink | null;
  loading?: boolean;
}

export type TerapeutaAvatar = Terapeuta & {
  avatarUrl?: string | null;
};

// Re-export necessários
export type { Paciente, Terapeuta, CadastroFormProps };