import { prisma } from "../../../../config/database.js";

export async function fetchMusicSessionsForChart(programId: string, stimulusId?: string, sort: 'asc' | 'desc' = 'asc') {
  const sessions = await prisma.sessao.findMany({
    where: {
      ocp_id: Number(programId),
      area: "musicoterapia",

      ...(stimulusId && {
        trials: {
          some: {
            estimulosOcp: {
              id_estimulo: Number(stimulusId),
            },
          },
        },
      }),
    },
    orderBy: { data_criacao: sort },
    select: {
      data_criacao: true,
      trials: {
        ...(stimulusId && {
          where: {
            estimulosOcp: {
              id_estimulo: Number(stimulusId),
            },
          },
        }),
        select: {
          participacao: true,
          suporte: true,
        }
      }
    }
  });

  return sessions.map(session => ({
    createdAt: session.data_criacao,
    trials: session.trials,
  }));
}