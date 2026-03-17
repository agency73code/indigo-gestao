import { prisma } from "../../../../config/database.js";

const MODEL_AREAS = 'musicoterapia';

export async function getMusicSessionsData(sessionIds: number[], stimulusIds: number[], therapistIdsScope?: string[]) {
  return prisma.sessao.findMany({
    where: {
      id: { in: sessionIds },
      area: MODEL_AREAS,
      ...(therapistIdsScope && { terapeuta_id: { in: therapistIdsScope } }),
    },
    include: {
      trials: {
        ...(stimulusIds.length > 0 && {
          where: { estimulos_ocp_id: { in: stimulusIds } },
        }),
        include: {
          estimulosOcp: true,
        },
      },
    },
    orderBy: { data_criacao: 'asc' }
  });
}