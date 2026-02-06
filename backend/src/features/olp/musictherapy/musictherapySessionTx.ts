import { programNotFound } from "../../../errors/programNotFound.js";
import type { Tx } from "../types/CreateSessionParams.js";
import { createSessionInDatabaseTx } from "../utils/createSessionInDatabaseTx.js";
import { uploadSessionFiles } from "../utils/uploadSessionFiles.js";
import type { MusictherapyInput } from "./types/MusictherapyInput.js";

export async function musictherapySessionTx(tx: Tx, input: MusictherapyInput) {
    const { programId, patientId, therapistId, notes, attempts, files = [], area } = input;

    const ocp = await tx.ocp.findUnique({
        where: { id: programId },
        select: {
            estimulo_ocp: {
                select: {
                    id: true,
                    id_estimulo: true 
                },
            },
        },
    });

    if (!ocp) throw programNotFound();

    const trialsData = attempts.map((a) => {
        const links = ocp.estimulo_ocp.find((v) => v.id_estimulo === Number(a.activityId));

        if (!links) {
            throw new Error(`A atividade ${a.activityId} não pertence a este programa.`);
        }

        return {
            estimulos_ocp_id: links.id,
            ordem: a.attemptNumber,
            resultado: a.type,
            participacao: a.participacao,
            suporte: a.suporte,
        };
    });

    const uploadedFiles = await uploadSessionFiles(files, programId, patientId);

    return await createSessionInDatabaseTx(tx, {
        programId,
        patientId,
        therapistId,
        notes,
        area,
        trialsData,
        uploadedFiles,
    });
}