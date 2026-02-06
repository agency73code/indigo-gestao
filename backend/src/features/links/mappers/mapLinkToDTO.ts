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
        valorSessao: link.valor_sessao,
        createdAt: link.criado_em,
        updatedAt: link.atualizado_em,
    };
}