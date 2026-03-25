import type { ClienteTherapistLinkListItem } from "../queries/ClienteTherapistLink.js";

export function mapLinkToDTO(link: ClienteTherapistLinkListItem) {
    return {
        id: link.id,
        patientId: link.cliente_id,
        therapistId: link.terapeuta_id,
        role: link.papel,
        startDate: link.data_inicio,
        endDate: link.data_fim ?? undefined,
        status: link.status,
        notes: link.observacoes ?? undefined,
        actuationArea: link.areaAtuacao.nome,
        valorClienteSessao: link.valor_cliente_sessao,
        valorSessaoConsultorio: link.valor_sessao_consultorio,
        valorSessaoHomecare: link.valor_sessao_homecare,
        valorHoraDesenvolvimentoMateriais: link.valor_hora_desenvolvimento_materiais,
        valorHoraSupervisaoRecebida: link.valor_hora_supervisao_recebida,
        valorHoraSupervisaoDada: link.valor_hora_supervisao_dada,
        valorHoraReuniao: link.valor_hora_reuniao,
        createdAt: link.criado_em,
        updatedAt: link.atualizado_em,
    };
}