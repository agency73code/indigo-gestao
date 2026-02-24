import { buildAvatarUrl } from '../../../utils/avatar-url.js';
import type {
    BaseLink,
    BaseTherapist,
    EstimuloItem,
    EstimuloOcpItem,
    FaturamentoItem,
    OcpItem,
    SessaoArquivoItem,
    SessaoItem,
    SessaoTrialItem,
} from './mobile.mapper.types.js';

const toIsoOrNull = (date: Date | null | undefined) => (date ? date.toISOString() : null);

const decimalToNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
        return value.toNumber();
    }

    return Number(value);
};

export function mapBootstrapBase(therapist: BaseTherapist, activeLinks: BaseLink[]) {
    const clientsById = new Map(activeLinks.map((link) => [link.cliente.id, link.cliente]));
    const areaById = new Map(activeLinks.map((link) => [link.areaAtuacao.id, link.areaAtuacao]));

    return {
        terapeuta: {
            id: therapist.id,
            nome: therapist.nome,
            email: therapist.email_indigo,
            perfilAcesso: therapist.perfil_acesso,
            atividade: therapist.atividade,
            atualizadoEm: toIsoOrNull(therapist.atualizado_em),
        },
        clientes: Array.from(clientsById.values()).map((client) => ({
            id: client.id,
            nome: client.nome,
            status: client.status,
            emailContato: client.emailContato,
            dataNascimento: client.dataNascimento,
            avatarUrl: buildAvatarUrl(client.arquivos),
            atualizadoEm: toIsoOrNull(client.atualizado_em),
        })),
        terapeutaClientes: activeLinks.map(({ cliente: _cliente, areaAtuacao: _areaAtuacao, ...link }) => ({
            id: link.id,
            terapeutaId: link.terapeuta_id,
            clienteId: link.cliente_id,
            areaAtuacaoId: link.area_atuacao_id,
            valorClienteSessao: decimalToNumber(link.valor_cliente_sessao),
            valorSessaoConsultorio: decimalToNumber(link.valor_sessao_consultorio),
            valorSessaoHomecare: decimalToNumber(link.valor_sessao_homecare),
            valorHoraDesenvolvimentoMateriais: decimalToNumber(link.valor_hora_desenvolvimento_materiais),
            valorHoraSupervisaoRecebida: decimalToNumber(link.valor_hora_supervisao_recebida),
            valorHoraSupervisaoDada: decimalToNumber(link.valor_hora_supervisao_dada),
            valorHoraReuniao: decimalToNumber(link.valor_hora_reuniao),
            dataInicio: link.data_inicio.toISOString(),
            dataFim: toIsoOrNull(link.data_fim),
            papel: link.papel,
            status: link.status,
            criadoEm: link.criado_em.toISOString(),
            atualizadoEm: link.atualizado_em.toISOString(),
        })),
        areasAtuacao: Array.from(areaById.values()).map((area) => ({
            id: area.id,
            nome: area.nome,
        })),
    };
}

export function mapBootstrapProgramas(ocps: OcpItem[]) {
    return {
        ocps: ocps.map((ocp) => ({
            id: ocp.id,
            clienteId: ocp.cliente_id,
            terapeutaId: ocp.terapeuta_id,
            nomePrograma: ocp.nome_programa,
            area: ocp.area,
            status: ocp.status,
            dataInicio: ocp.data_inicio.toISOString(),
            dataFim: ocp.data_fim.toISOString(),
            criadoEm: ocp.criado_em.toISOString(),
            atualizadoEm: ocp.atualizado_em.toISOString(),
        })),
    };
}

export function mapBootstrapEstimulos(estimuloOcp: EstimuloOcpItem[], estimulos: EstimuloItem[]) {
    return {
        estimuloOcps: estimuloOcp.map((item) => ({
            id: item.id,
            estimuloId: item.id_estimulo,
            ocpId: item.id_ocp,
            nomeOverride: item.nome,
            descricao: item.descricao,
            metodos: item.metodos,
            tecnicasProcedimentos: item.tecnicas_procedimentos,
            status: item.status ? 1 : 0,
            criadoEm: null,
            atualizadoEm: null,
        })),
        estimulos: estimulos.map((estimulo) => ({
            id: estimulo.id,
            nome: estimulo.nome,
            descricao: estimulo.descricao,
            criadoEm: null,
            atualizadoEm: null,
        })),
    };
}

export function mapBootstrapSessoes(
    sessoes: SessaoItem[],
    sessaoTrials: SessaoTrialItem[],
    faturamentos: FaturamentoItem[],
    sessaoArquivos: SessaoArquivoItem[],
) {
    return {
        sessoes: sessoes.map((sessao) => ({
            id: sessao.id,
            ocpId: sessao.ocp_id,
            clienteId: sessao.cliente_id,
            terapeutaId: sessao.terapeuta_id,
            area: sessao.area,
            observacoesSessao: sessao.observacoes_sessao,
            dataCriacao: sessao.data_criacao.toISOString(),
            criadoEm: sessao.criado_em.toISOString(),
            atualizadoEm: sessao.atualizado_em.toISOString(),
        })),
        sessaoTrials: sessaoTrials.map((trial) => ({
            id: trial.id,
            sessaoId: trial.sessao_id,
            estimuloOcpId: trial.estimulos_ocp_id,
            ordem: trial.ordem,
            resultado: trial.resultado,
            duracaoMinutos: trial.duracao_minutos,
            utilizouCarga: trial.utilizou_carga,
            valorCarga: trial.valor_carga,
            teveDesconforto: trial.teve_desconforto,
            descricaoDesconforto: trial.descricao_desconforto,
            teveCompensacao: trial.teve_compensacao,
            descricaoCompensacao: trial.descricao_compensacao,
            participacao: trial.participacao,
            suporte: trial.suporte,
            criadoEm: null,
            atualizadoEm: null,
        })),
        faturamentos: faturamentos.map((billing) => ({
            id: billing.id,
            sessaoId: billing.sessao_id,
            clienteId: billing.cliente_id,
            terapeutaId: billing.terapeuta_id,
            inicioEm: billing.inicio_em.toISOString(),
            fimEm: billing.fim_em.toISOString(),
            tipoAtendimento: billing.tipo_atendimento,
            status: billing.status,
            ajudaCusto: billing.ajuda_custo,
            valorAjudaCusto: billing.valor_ajuda_custo ? decimalToNumber(billing.valor_ajuda_custo) : null,
            observacaoFaturamento: billing.observacao_faturamento,
            motivoRejeicao: billing.motivo_rejeicao,
            criadoEm: billing.criado_em.toISOString(),
            atualizadoEm: billing.atualizado_em.toISOString(),
        })),
        sessaoArquivos: sessaoArquivos.map((file) => ({
            id: file.id,
            sessaoId: file.sessao_id,
            nome: file.nome,
            caminho: file.caminho,
            tamanho: file.tamanho,
            criadoEm: file.criado_em.toISOString(),
            atualizadoEm: file.atualizado_em.toISOString(),
        })),
    };
}
