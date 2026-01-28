import { prisma } from "../../../../config/database.js";

const OT_MODEL_AREAS = ['terapia-ocupacional'];

export async function getOccupationalSessionData(sessionIds: number[], stimulusIds: number[]) {
  return prisma.sessao.findMany({
    where: {
      id: { in: sessionIds },
      area: { in: OT_MODEL_AREAS },
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