import type { Tx } from "../types/CreateSessionParams.js";
import type { CreateSessionInDatabaseInput } from "../types/olp.types.js";

export async function createSessionInDatabaseTx(tx: Tx, input: CreateSessionInDatabaseInput) {
  const { programId, patientId, therapistId, notes, area, trialsData, uploadedFiles, } = input;

  return tx.sessao.create({
    data: {
      ocp_id: programId,
      cliente_id: patientId,
      terapeuta_id: therapistId,
      observacoes_sessao: notes?.trim() || null,
      area,

      trials: { create: trialsData },
      arquivos: { create: uploadedFiles },
    },

    include: {
      trials: true,
      arquivos: true,
    },
  });
}