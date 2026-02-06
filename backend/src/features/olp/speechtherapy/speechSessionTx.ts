import { programNotFound } from "../../../errors/programNotFound.js";
import type { Tx } from "../types/CreateSessionParams.js";
import { createSessionInDatabaseTx } from "../utils/createSessionInDatabaseTx.js";
import { uploadSessionFiles } from "../utils/uploadSessionFiles.js";
import type { SpeechTherapyInput } from "./types/SpeechTherapyInput.js";

export async function SpeechTherapySessionTx(tx: Tx, input: SpeechTherapyInput) {
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
        const links = ocp.estimulo_ocp.find((v) => v.id_estimulo === Number(a.stimulusId));

        if (!links) {
            throw new Error(`A atividade ${a.stimulusId} não pertence a este programa.`);
        }

        return {
            estimulos_ocp_id: links.id,
            ordem: a.attemptNumber,
            resultado: a.type,
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