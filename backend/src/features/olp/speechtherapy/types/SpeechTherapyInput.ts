import type { UploadedFile } from "../../types/CreateSessionParams.js";
import type { CreateAreaSessionData } from "../../types/olp.schema.js";

type SpeechAreas = "fonoaudiologia" | "psicopedagogia" | "terapia-aba";

export type SpeechTherapyInput = Extract<CreateAreaSessionData, { area: SpeechAreas }> & {
    files: UploadedFile[];
}