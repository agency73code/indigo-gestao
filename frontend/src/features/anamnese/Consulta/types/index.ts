/**
 * Tipos para Consulta/Visualização de Anamnese
 * 
 * Re-exporta tipos base e define aliases para compatibilidade
 */

// Re-exporta todos os tipos base
export * from '../../types';

// ============================================
// ALIASES PARA COMPATIBILIDADE
// ============================================

import type {
    Cuidador,
    EspecialidadeConsultada,
    MedicamentoEmUso,
    ExamePrevio,
    TerapiaPrevia,
    ArquivoAnexo,
    HistoricoFamiliar,
    AtividadeRotina,
    GestacaoParto,
    DesenvolvimentoNeuropsicomotor,
    DesenvolvimentoFalaLinguagem,
    Desfralde,
    Sono,
    HabitosHigiene,
    Alimentacao,
    DesenvolvimentoSocial,
    DesenvolvimentoAcademico,
    EstereotipiasRituais,
    ProblemasComportamento,
    AnamneseBase,
    MarcoDesenvolvimento,
    DesfraldeTempo,
    SimNao,
    SimNaoComAjuda,
} from '../../types';

// Aliases com sufixo "Detalhe" para compatibilidade
export type CuidadorDetalhe = Cuidador;
export type EspecialidadeConsultadaDetalhe = EspecialidadeConsultada;
export type MedicamentoDetalhe = MedicamentoEmUso;
export type ExameDetalhe = ExamePrevio;
export type TerapiaDetalhe = TerapiaPrevia;
export type ArquivoAnexoDetalhe = ArquivoAnexo;
export type HistoricoFamiliarDetalhe = HistoricoFamiliar;
export type AtividadeRotinaDetalhe = AtividadeRotina;
export type GestacaoPartoDetalhe = GestacaoParto;
export type NeuropsicomotorDetalhe = DesenvolvimentoNeuropsicomotor;
export type FalaLinguagemDetalhe = DesenvolvimentoFalaLinguagem;
export type DesfraldeDetalhe = Desfralde;
export type SonoDetalhe = Sono;
export type HabitosHigieneDetalhe = HabitosHigiene;
export type AlimentacaoDetalhe = Alimentacao;
export type DesenvolvimentoSocialDetalhe = DesenvolvimentoSocial;
export type DesenvolvimentoAcademicoDetalhe = DesenvolvimentoAcademico;
export type EstereotipiasRituaisDetalhe = EstereotipiasRituais;
export type ProblemasComportamentoDetalhe = ProblemasComportamento;

// Re-export dos tipos já existentes para manter compatibilidade
export type { MarcoDesenvolvimento, DesfraldeTempo, SimNao, SimNaoComAjuda };

// Tipo completo de detalhe de anamnese
export type AnamneseDetalhe = AnamneseBase;
