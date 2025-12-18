import { prisma } from "../config/database.js";

interface Session extends Record <string, unknown> {
  id: number;
  ocp_id: number;
  terapeuta_id: string;
  data_criacao: Date;
  observacoes_sessao: string | null;
}
type Sessions = Session[];

export async function sessionObservations(sessions: Sessions) {
    const ocpsIds = Array.from(
        new Set(sessions.map(s => s.ocp_id))
    );

    const therapistIds = Array.from(
        new Set(sessions.map(s => s.terapeuta_id))
    );

    const ocps = await prisma.ocp.findMany({
        where: { id: { in: ocpsIds } },
        select: {
            id: true,
            nome_programa: true,
        }
    });

    const therapists = await prisma.terapeuta.findMany({
        where: { id: { in: therapistIds } },
        select: {
            id: true,
            nome: true,
        },
    });

    const ocpMap = new Map(
        ocps.map(o => [o.id, o.nome_programa])
    );

    const therapistMap = new Map(
        therapists.map(t => [t.id, t.nome])
    );

    return sessions.map(session => ({
        id: session.id,
        data: session.data_criacao,
        programa: ocpMap.get(session.ocp_id),
        terapeutaNome: therapistMap.get(session.terapeuta_id),
        observacoes: session.observacoes_sessao,
    }));
}