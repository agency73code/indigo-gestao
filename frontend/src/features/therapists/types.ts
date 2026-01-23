export interface TherapistProfessionalData {
  cargo: string;
  areaAtuacao: string;
  numeroConselho?: string | null | undefined;
}

export interface TherapistSelectDTO {
  id: string;
  nome: string;
  avatarUrl: string | null;
  dadosProfissionais: Array<Pick<TherapistProfessionalData, 'cargo' | 'areaAtuacao'>>;
}

export interface TherapistListDTO {
  id: string;
  nome: string;
  avatarUrl: string | null;
  dadosProfissionais: Array<TherapistProfessionalData>;
}

export type TherapistId = TherapistListDTO['id'];