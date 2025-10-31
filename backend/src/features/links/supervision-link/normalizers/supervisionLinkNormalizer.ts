import type { vinculo_supervisao } from "@prisma/client";

/**
 * Normaliza o retorno de um vínculo de supervisão
 * Convertendo o padrão do banco (pt-BR) para o padrão do frontend (en-US)
 */
export function normalizeSupervisionLink(
    vinculo: vinculo_supervisao
) {
    const status = vinculo.status === 'ativo' 
        ? 'active'
        : vinculo.status === 'encerrado'
        ? 'ended'
        : 'archived';

    return {
        id: vinculo.id,
        supervisorId: vinculo.supervisor_id,
        supervisedTherapistId: vinculo.clinico_id,
        hierarchyLevel: vinculo.nivel_hierarquia ?? 1,
        supervisionScope: vinculo.escopo_supervisao === 'direto' ? 'direct' : 'team',
        startDate: vinculo.data_inicio.toISOString().split('T')[0],
        endDate: vinculo.data_fim ? vinculo.data_fim.toISOString().split('T')[0] : null,
        status,
        notes: vinculo.observacoes ?? null,
        createdAt: vinculo.criado_em.toISOString(),
        updatedAt: vinculo.atualizado_em.toISOString(),
    };
}

/**
 * Normaliza uma lista de vínculos de supervisão
 * Retorna um array já adaptado ao formato esperado pelo frontend.
 */
export function normalizeSupervisionLinks(
    vinculos: vinculo_supervisao[]
) {
    return vinculos.map(normalizeSupervisionLink);
}

/**
 * Converte o payload recebido do frontend para o formato interno do backend.
 * Tradução reversa do normalizer.
 */
