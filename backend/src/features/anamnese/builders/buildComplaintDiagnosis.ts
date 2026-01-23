import type { Prisma } from '@prisma/client';
import type { AnamnesePayload } from '../../../schemas/anamnese.schema.js';
import { maybeCreateList } from './helpers.js';
import { ensureFilenameWithExt } from '../../file/r2/ensureFilenameWithExt.js';

type ComplaintDiagnosisPayload = AnamnesePayload['queixaDiagnostico'];

type ComplaintDiagnosisCreateInput = Pick<Prisma.anamneseCreateInput, 'queixa_diagnostico'>;

export function buildComplaintDiagnosis(
    complaintDiagnosis: ComplaintDiagnosisPayload,
): ComplaintDiagnosisCreateInput {
    const especialidadesConsultadas = maybeCreateList(
        complaintDiagnosis.especialidadesConsultadas,
        (especialidade) => ({
            especialidade: especialidade.especialidade ?? null,
            nome: especialidade.nome ?? null,
            data: especialidade.data ?? null,
            observacao: especialidade.observacao ?? null,
            ativo: especialidade.ativo ?? null,
        }),
    );

    const medicamentosEmUso = maybeCreateList(complaintDiagnosis.medicamentosEmUso, (medicamento) => ({
        nome: medicamento.nome ?? null,
        dosagem: medicamento.dosagem ?? null,
        data_inicio: medicamento.dataInicio ?? null,
        motivo: medicamento.motivo ?? null,
    }));

    const examesPrevios = maybeCreateList(complaintDiagnosis.examesPrevios, (exame) => {
        const arquivos = maybeCreateList(
            exame.arquivos?.filter((arquivo) => !arquivo.removed),
            (arquivo) => ({
                nome: ensureFilenameWithExt({
                    name: arquivo.nome,
                    path: arquivo.caminho,
                    mime_type: arquivo.tipo,
                }),
                tipo: arquivo.tipo ?? null,
                tamanho: arquivo.tamanho ?? null,
                caminho: arquivo.caminho ?? null,
            }),
        );

        return {
            nome: exame.nome ?? null,
            data: exame.data ?? null,
            resultado: exame.resultado ?? null,
            ...(arquivos && { arquivos }),
        };
    });

    const terapiasPrevias = maybeCreateList(complaintDiagnosis.terapiasPrevias, (terapia) => ({
        profissional: terapia.profissional ?? null,
        especialidade_abordagem: terapia.especialidadeAbordagem ?? null,
        tempo_intervencao: terapia.tempoIntervencao ?? null,
        observacao: terapia.observacao ?? null,
        ativo: terapia.ativo ?? null,
    }));

    return {
        queixa_diagnostico: {
            create: {
                queixa_principal: complaintDiagnosis.queixaPrincipal,
                diagnostico_previo: complaintDiagnosis.diagnosticoPrevio ?? null,
                suspeita_condicao_associada: complaintDiagnosis.suspeitaCondicaoAssociada ?? null,
                ...(especialidadesConsultadas && {
                    especialidades_consultada: especialidadesConsultadas,
                }),
                ...(medicamentosEmUso && {
                    medicamentos_em_uso: medicamentosEmUso,
                }),
                ...(examesPrevios && {
                    exames_previos: examesPrevios,
                }),
                ...(terapiasPrevias && {
                    terapias_previas: terapiasPrevias,
                }),
            },
        },
    };
}
