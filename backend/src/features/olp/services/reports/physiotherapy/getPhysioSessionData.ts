import { prisma } from "../../../../../config/database.js";

export async function getPhysioSessionData(sessionIds: number[], stimulusIds: number[]) {
  return prisma.sessao.findMany({
    where: {
      id: { in: sessionIds },
      area: 'fisioterapia',
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