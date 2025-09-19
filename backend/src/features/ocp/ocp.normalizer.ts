import type { getOCP } from "./ocp.types.js";
import { differenceInYears } from 'date-fns';

export function mapOcpDetail(dto: any): getOCP {
    return {
        id: dto.id.toString(),
        name: dto.nome_programa,
        patientId: dto.cliente_id,
        patientName: dto.cliente.nome,
        patientGuardian: dto.cliente.cliente_responsavel?.[0].responsaveis.nome,
        patientAge: differenceInYears(new Date(), dto.cliente.data_nascimento),
        patientPhotoUrl: null,
        therapistId: dto.criador_id,
        therapistName: dto.criador.nome,
        createdAt: dto.criado_em.toISOString(),
        goalTitle: dto.objetivo_programa,
        goalDescription: dto.objetivo_descricao,
        stimuli: dto.estimulo_ocp?.map((s: any, idx: number) => ({
            id: s.id_estimulo.toString(),
            order: idx + 1,
            label: s.nome,
            description: s.descricao,
            active: s.status,
        })) ?? [],
        status: dto.status,
    }
}