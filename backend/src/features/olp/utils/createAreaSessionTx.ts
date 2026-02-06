import { musictherapySessionTx } from "../musictherapy/musictherapySessionTx.js";
import { occupationalTherapySessionTx } from "../occupationaltherapy/occupationalTherapySessionTx.js";
import { physiotherapySessionTx } from "../physiotherapy/physiotherapySessionTx.js";
import { SpeechTherapySessionTx } from "../speechtherapy/speechSessionTx.js";
import type { Tx, UploadedFile } from "../types/CreateSessionParams.js";
import type { CreateAreaSessionData } from "../types/olp.schema.js";

export async function createAreaSessionTx(tx: Tx, input: CreateAreaSessionData & { files: UploadedFile[] }) {
    switch (input.area) {
        case "fonoaudiologia":
            return await SpeechTherapySessionTx(tx, input);

        case "fisioterapia":
        case "psicomotricidade":
        case "educacao-fisica":
            return await physiotherapySessionTx(tx, input);

        case "terapia-ocupacional":
            return await occupationalTherapySessionTx(tx, input);

        case "musicoterapia":
            return await musictherapySessionTx(tx, input);
    }
}