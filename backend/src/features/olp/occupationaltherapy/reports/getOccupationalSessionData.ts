import { prisma } from "../../../../config/database.js";

const OT_MODEL_AREAS = ['terapia-ocupacional'];

export async function getOccupationalSessionData(sessionIds: number[], stimulusIds: number[], therapistIdsScope?: string[]) {
  return prisma.sessao.findMany({
    where: {
      id: { in: sessionIds },
      area: { in: OT_MODEL_AREAS },
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