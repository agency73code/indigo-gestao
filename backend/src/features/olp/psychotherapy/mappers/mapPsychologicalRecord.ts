import { buildAvatarUrl } from "../../../../utils/avatar-url.js";
import { calculateAge } from "../../../../utils/calculateAge.js";
import { toDateOnly } from "../../../../utils/toDateOnly.js";
import type { PsychologicalRecordRow } from "../querys/queryPsychologicalRecord.js";
import { inferFileType } from "../utils/inferFileType.js";

export function mapPsychologicalRecord(medicalRecord: PsychologicalRecordRow) {
    return {
        id: medicalRecord.id,
        cliente_id: medicalRecord.cliente_id,
        terapeuta_id: medicalRecord.terapeuta_id,

        // Informações Educacionais
        informacoes_educacionais: {
            nivel_escolaridade: medicalRecord.clientes.nivel_escolaridade,
            instituicao_formacao: medicalRecord.clientes.dadosEscola?.nome,
            profissao_ocupacao: medicalRecord.profissao_ocupacao,
            observacoes: medicalRecord.observacao_educacional,
        },

        // Núcleo Familiar
        nucleo_familiar: medicalRecord.clientes.cuidadores.map((c) => ({
            id: String(c.id),
            nome: c.nome,
            cpf: c.cpf ?? undefined,
            parentesco: c.relacao,
            descricao_relacao: c.descricaoRelacao ?? undefined,
            data_nascimento: toDateOnly(c.dataNascimento) ?? undefined,
            idade: c.dataNascimento ? calculateAge(c.dataNascimento) : undefined,
            ocupacao: c.profissao ?? undefined,
            origem_banco: true,
        })),
        observacoes_nucleo_familiar: medicalRecord.observacoes_nucleo_familiar,

        // Avaliação da Demanda
        avaliacao_demanda: {
            encaminhado_por: medicalRecord.encaminhado_por,
            motivo_busca_atendimento: medicalRecord.motivo_busca_atendimento,
            atendimentos_anteriores: medicalRecord.atendimentos_anteriores,
            observacoes: medicalRecord.observacao_demanda,
            terapias_previas: medicalRecord.clientes.anamneses
                .flatMap((a) => a.queixa_diagnostico?.terapias_previas ?? [])
                .map((tp) => ({
                    id: String(tp.id),
                    profissional: tp.profissional ?? 'Não informado',
                    especialidade_abordagem: tp.especialidade_abordagem ?? 'Não informado',
                    tempo_intervencao: tp.tempo_intervencao ?? 'Não informado',
                    observacao: tp.observacao ?? undefined,
                    ativo: tp.ativo,
                    origem_anamnese: true,
                })),
        },

        // Objetivos e Avaliação
        objetivos_trabalho: medicalRecord.objetivos_trabalho,
        avaliacao_atendimento: medicalRecord.avaliacao_atendimento,

        // Evoluções
        evolucoes: medicalRecord.evolucoes.map((e, i) => ({
            id: e.id,
            numero_sessao: i + 1,
            data_evolucao: e.data_evolucao,
            descricao_sessao: e.descricao_sessao,
            arquivos: e.anexos.map((a) => ({
                id: a.id,
                nome: a.nome,
                tipo: inferFileType(a.tipo),
                mime_type: a.tipo ?? undefined,
                tamanho: a.tamanho,
                url: a.caminho ?? undefined,
                caminho: a.caminho ?? undefined,
                arquivo_id: a.caminho ?? undefined,
            })),
            criado_em: e.criado_em ?? undefined,
            atualizado_em: e.atualizado_em ?? undefined,
        })),

        // Metadados
        status: medicalRecord.status ? 'ativo' : 'inativo',
        criado_em: medicalRecord.criado_em,
        atualizado_em: medicalRecord.atualizado_em ?? undefined,

        // Relacionamentos expandidos (quando incluídos)
        cliente: {
            id: medicalRecord.cliente_id,
            nome: medicalRecord.clientes.nome,
            data_nascimento: toDateOnly(medicalRecord.clientes.dataNascimento),
            idade: calculateAge(medicalRecord.clientes.dataNascimento),
            genero: medicalRecord.clientes.genero ?? undefined,
            foto_url: buildAvatarUrl(medicalRecord.clientes.arquivos),
        },
        terapeuta: {
            id: medicalRecord.terapeuta_id,
            nome: medicalRecord.terapeutas.nome,
            crp: medicalRecord.terapeutas.registro_profissional[0]?.numero_conselho ?? undefined,
            foto_url: buildAvatarUrl(medicalRecord.terapeutas.arquivos),
        },
    }
}