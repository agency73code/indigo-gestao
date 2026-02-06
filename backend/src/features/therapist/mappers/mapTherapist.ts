import { normalizeAddress } from "../../../utils/buildAddress.js";
import { toDateOnly } from "../../../utils/toDateOnly.js";
import type { TherapistRow } from "../querys/queryTherapist.js";

export function mapTherapist(dto: TherapistRow) {
    const postgraduateStudies = dto.formacao?.pos_graduacao ? dto.formacao?.pos_graduacao : [];

    return {
        nome: dto.nome,
        email: dto.email,
        emailIndigo: dto.email_indigo,
        telefone: dto.telefone,
        celular: dto.celular,
        cpf: dto.cpf,
        dataNascimento: toDateOnly(dto.data_nascimento),

        endereco: normalizeAddress(dto.endereco),

        possuiVeiculo: dto.possui_veiculo ? 'sim' : 'nao',
        placaVeiculo: dto.placa_veiculo,
        modeloVeiculo: dto.modelo_veiculo,
        banco: dto.banco,
        agencia: dto.agencia,
        conta: dto.conta,
        pixTipo: dto.pix_tipo,
        chavePix: dto.chave_pix,

        dadosProfissionais: dto.registro_profissional.map((rp) => ({
            areaAtuacao: rp.area_atuacao.nome,
            areaAtuacaoId: rp.area_atuacao_id,
            cargo: rp.cargo?.nome,
            cargoId: rp.cargo_id,
            numeroConselho: rp.numero_conselho,
        })),

        dataInicio: toDateOnly(dto.data_entrada),
        dataFim: dto.data_saida ? toDateOnly(dto.data_saida) : undefined,
        valorSessaoConsultorio: dto.valor_sessao_consultorio,
        valorSessaoHomecare: dto.valor_sessao_homecare,
        valorHoraDesenvolvimentoMateriais: dto.valor_hora_desenvolvimento_materiais,
        valorHoraSupervisaoRecebida: dto.valor_hora_supervisao_recebida,
        valorHoraSupervisaoDada: dto.valor_hora_supervisao_dada,
        valorHoraReuniao: dto.valor_hora_reuniao,
        professorUnindigo: dto.professor_uni ? 'sim' : 'nao',
        disciplinaUniindigo: dto.disciplina[0]?.nome,

        formacao: {
            graduacao: dto.formacao?.graduacao,
            instituicaoGraduacao: dto.formacao?.instituicao_graduacao,
            anoFormatura: dto.formacao?.ano_formatura,

            posGraduacoes: postgraduateStudies.length > 0 ? postgraduateStudies?.map((pg) => ({
                tipo: pg.tipo,
                curso: pg.curso,
                instituicao: pg.instituicao,
                conclusao: pg.conclusao,
            })) : undefined,

            participacaoCongressosDescricao: dto.formacao?.participacao_congressos,
            publicacoesLivrosDescricao: dto.formacao?.publicacoes_descricao
        },

        cnpj: {
            numero: dto.pessoa_juridica?.cnpj,
            razaoSocial: dto.pessoa_juridica?.razao_social,
            nomeFantasia: dto.pessoa_juridica?.razao_social,

            endereco: normalizeAddress(dto.pessoa_juridica?.endereco),
        },

        arquivos: dto.arquivos?.map((a) => ({
            nome: a.tipo,
            arquivo_id: a.arquivo_id,
            mime_type: a.mime_type,
            tamanho: Number(a.tamanho ?? 0),
            data: a.data_upload ? a.data_upload.toISOString() : null,
        })),
    }
}