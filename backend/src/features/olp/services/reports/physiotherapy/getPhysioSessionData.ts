import { prisma } from "../../../../../config/database.js";

// Áreas que usam o modelo Fisio/TO (terapia ocupacional)
const FISIO_MODEL_AREAS = ['fisioterapia', 'psicomotricidade', 'educacao-fisica'];

export async function getPhysioSessionData(sessionIds: number[], stimulusIds: number[]) {
  return prisma.sessao.findMany({
    where: {
      id: { in: sessionIds },
      area: { in: FISIO_MODEL_AREAS },
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